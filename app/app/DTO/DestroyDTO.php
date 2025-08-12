<?php

namespace App\DTO;

use App\Enums\Errors;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DestroyDTO extends AbstractDTO
{

    private Transaction $transaction;

    protected function __construct(
        public ?int $id = null,
    )
    {
    }
    public static function createFromRequest(Request $request): static
    {
        $data = $request->all();
        $validator = Validator::make($data, [
            'id' => 'required|integer|exists:transactions,id',
        ]);
        if ($validator->fails()) {
            return static::handleValidationErrors($validator);
        }
        $result = new static($data['id']);
        $user = auth()->user();
        $user !== null && $result->setRequestUser($user);
        return $result->validate();
    }

    public function getTransaction(): Transaction
    {
        return $this->transaction;
    }

    protected function selfValidate(): void
    {
        $transaction = Transaction::find($this->id);
        if (!empty($transaction)){
            $this->transaction = $transaction;
        } else {
            $this->makeError(Errors::TRANSACTION_NOT_FOUND, 400);
        }
    }
}
