<?php

namespace App\DTO;

use App\Enums\Errors;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/** DTO для удаления записи из таблицы */
class DestroyDTO extends AbstractDTO
{

    /** @var Transaction Удаляемая запись */
    private Transaction $transaction;

    /**
     * Закрытый конструктор
     * @param int|null $id
     */
    protected function __construct(
        public ?int $id = null,
    )
    {
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
            'id' => 'required|integer|exists:transactions,id',
        ]);
        if ($validator->fails()) {
            return static::handleValidationErrors($validator);
        }
        $result = new static($data['id']);
        /** @var User $user */
        $user = auth()->user();
        $user !== null && $result->setRequestUser($user);
        return $result->validate();
    }

    /**
     * Валидация
     * @return void
     */
    protected function selfValidate(): void
    {
        $transaction = Transaction::find($this->id);
        if (!empty($transaction)) {
            $this->transaction = $transaction;
        } else {
            $this->makeError(Errors::TRANSACTION_NOT_FOUND, 400);
        }
    }

    /**
     * Получение удаляемой записи
     * @return Transaction
     */
    public function getTransaction(): Transaction
    {
        return $this->transaction;
    }

}
