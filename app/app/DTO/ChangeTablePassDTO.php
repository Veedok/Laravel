<?php

namespace App\DTO;

use App\Enums\Errors;
use App\Models\Table;
use App\Models\Transaction;
use App\Models\User;
use App\Models\UserTable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use JsonException;

/** DTO для получения графиков */
class ChangeTablePassDTO extends AbstractDTO
{
    public ?UserTable $relation;

    /**
     * Закрытый конструктор
     * @param int|Table|null $table
     * @param string|null $key
     * @param string|null $salt
     */
    protected function __construct(
        public int|Table|null $table = null,
        public ?string    $key = null,
        public ?string    $salt = null,
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
            'newKey' => 'required|string',
            'salt' => 'required|string',
        ]);
        if ($validator->fails()) {
            return static::handleValidationErrors($validator);
        }
        $result = new static($data['tableId'], $data['newKey'], $data['salt']);
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
       $this->relation = $this->table->userTables()->where('user_id', auth()->id())->first();
       if ($this->table instanceof Table && empty($this->relation)) {
           $this->makeError(Errors::TABLE_NOT_FOUND, 404);
       }
       if (empty($this->relation->key)) {
           $this->makeError(Errors::TABLE_IS_NOT_ENCRYPTED, 400);
       }
    }
}
