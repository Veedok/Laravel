<?php

namespace App\DTO;

use App\Enums\Errors;
use App\Models\Table;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use JsonException;

/** DTO для получения графиков */
class CryptoDTO extends AbstractDTO
{
    /**
     * Закрытый конструктор
     * @param string|null $type
     * @param int|null $table
     */
    protected function __construct(
        public int|Table|null $table = null,
        public ?array    $users = null,
        public ?array    $transactions = null,
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
            'tableId' => 'required|integer|exists:tables,id',
            'users' => 'required|array|min:1',
            'transactions' => 'required|array',
        ]);
        if ($validator->fails()) {
            return static::handleValidationErrors($validator);
        }
        $result = new static($data['tableId'], $data['users'], $data['transactions']);
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
       $this->table = $this->findModel($this->table, 'table');
        if (isset($this->table) && !$this->requestUser->tables()->find($this->table)?->exists()){
            $this->makeError(Errors::TABLE_NOT_FOUND, 404);
        }
        if (!$this->table->isOwner($this->requestUser->id)){
            $this->makeError(Errors::ACCESS_DENIED, 403);
        }
    }
}
