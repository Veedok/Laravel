<?php

namespace App\DTO;

use App\Enums\Errors;
use App\Models\Table;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use JsonException;

/** DTO для обновления транзакции */
class UpdateTransactionDTO extends AbstractDTO
{

    /** @var Transaction Обновляемая запись */
    public Transaction $transaction;

    /**
     * Закрытый конструктор
     * @param int|null $table
     * @param int|null $id
     * @param string|null $name
     * @param bool $changeBalance
     * @param float|null $sum
     * @param Carbon|null $date
     */
    protected function __construct(
        public ?int              $table = null,
        public ?int              $id = null,
        public ?string           $name = null,
        public ?bool             $changeBalance = false,
        public float|string|null $sum = null,
        public ?Carbon           $date = null,
        public null|string|array $tags = null
    )
    {
        if (is_float($this->sum)) {
            $this->sum = round($this->sum, 2);
        }
    }

    /**
     * Создание класса из запроса
     * @param Request $request
     * @return static
     */
    public static function createFromRequest(Request $request): static
    {
        $data = $request->all();
        $validator = Validator::make($data, [
            'tableId' => 'required|integer|exists:tables,id',
            'id' => 'required|integer',
            'name' => 'required_without_all:changeBalance,sum,date,tags|string|max:255',
            'type' => 'required_without_all:title,sum,date,tags|bool',
            'sum' => 'required_without_all:title,changeBalance,date,tags',
            'date' => 'required_without_all:sum,changeBalance,title,tags|date',
            'tags' => 'nullable|string'
        ]);
        if ($validator->fails()) {
            return static::handleValidationErrors($validator);
        }
        $result = new static($data['tableId'], $data['id'], $data['name'], $data['type'], $data['sum'], new Carbon($data['date']), ($data['tags'] ?? []));
        /** @var User $user */
        $user = auth()->user();
        $user !== null && $result->setRequestUser($user);
        return $result->validate();
    }

    /**
     * Валидация
     * @return void
     * @throws JsonException
     */
    protected function selfValidate(): void
    {
        /** @var Table $table */
        $table = $this->requestUser->tables()->find($this->table);
        /** @var Transaction $transaction */
        $transaction = $table?->transactions()->find($this->id);
        if (!$transaction) {
            $this->makeError(Errors::TRANSACTION_NOT_FOUND, 400);
        } elseif (!$this->requestUser->checkTablePermission($this->table, 'editTransactions')) {
            $this->makeError(Errors::ACCESS_DENIED, 400);
        } else {
            !empty($this->tags) && $this->tags = explode(' ', $this->tags);
            $changedTag = array_column($transaction->tags->toArray(), 'name') !== $this->tags;
            (!empty($this->sum) && $this->sum === $transaction->sum) && $this->sum = null;
            (!empty($this->name) && $this->name === $transaction->name) && $this->name = null;
            (!empty($this->date) && $transaction->date->format('d.m.Y') === $this->date->format('d.m.Y')) && $this->date = null;
            (($transaction->type === 'expense' && !$this->changeBalance) || ($transaction->type === 'income' && $this->changeBalance)) && $this->changeBalance = null;
            if (!isset($this->date) && !isset($this->sum) && !isset($this->name) && !isset($this->changeBalance) && !$changedTag) {
                $this->makeError(Errors::NOTING_CHANGE, 400);
            } else {
                $this->changeTransaction($transaction);
            }
        }
    }

    /**
     * Установка изменяемой записи
     * @param Transaction $transaction
     * @return void
     */
    private function changeTransaction(Transaction $transaction): void
    {
        $this->transaction = $transaction;
    }
}
