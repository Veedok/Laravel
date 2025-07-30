<?php

namespace App\DTO;

use App\Enums\Errors;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UpdateTransactionDTO extends AbstractDTO
{

    public Transaction $transaction;

    private function __construct(
        public ?int    $id = null,
        public ?string $name = null,
        public ?bool   $changeBalance = false,
        public ?float  $sum = null,
        public ?Carbon $date = null
    )
    {
        if ($this->sum !== null) {
            $this->sum = round($this->sum, 2);
        }
    }

    public static function createFromRequest(Request $request): static
    {
        $data = $request->all();
        $validator = Validator::make($data, [
            'id' => 'required|integer',
            'title' => 'required_without_all:changeBalance,sum,date|string|max:255',
            'changeBalance' => 'required_without_all:title,sum,date|bool',
            'sum' => 'required_without_all:title,changeBalance,date|numeric',
            'date' => 'required_without_all:sum,changeBalance,title|date'
        ]);
        if ($validator->fails()) {
            return static::handleValidationErrors($validator);
        }
        $result = new static($data['id'], $data['title'], $data['changeBalance'], $data['sum'], new Carbon($data['date']));
        $user = auth()->user();
        $user !== null && $result->setRequestUser($user);
        return $result->validate();
    }

    protected function selfValidate(): void
    {
        /** @var null|Transaction $transaction */
        $transaction = $this->requestUser->transactions()->find($this->id);
        if (!$transaction) {
            $this->makeError(Errors::TRANSACTION_NOT_FOUND, 400);
        } else {
            (!empty($this->sum) && $this->sum === $transaction->sum) && $this->sum = null;
            (!empty($this->name) && $this->name === $transaction->name) && $this->name = null;
            (!empty($this->date) && $transaction->date->format('d.m.Y') === $this->date->format('d.m.Y')) && $this->date = null;
            (($transaction->type === 'expense' && !$this->changeBalance) || ($transaction->type === 'income' && $this->changeBalance)) && $this->changeBalance = null;
            if (!isset($this->date) && !isset($this->sum) && !isset($this->name) && !isset($this->changeBalance)) {
                $this->makeError(Errors::NOTING_CHANGE, 400);
            } else {
                $this->chengeTransaction($transaction);
            }

        }
    }

    private function chengeTransaction(Transaction $transaction)
    {
        $this->transaction = $transaction;
    }
}
