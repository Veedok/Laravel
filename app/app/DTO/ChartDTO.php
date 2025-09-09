<?php

namespace App\DTO;

use App\Enums\Errors;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use JsonException;

/** DTO для получения графиков */
class ChartDTO extends AbstractDTO
{
    /**
     * Закрытый конструктор
     * @param string|null $type
     * @param int|null $table
     */
    protected function __construct(
        public ?string $type = 'income',
        public ?int    $table = null,
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
            'type' => 'nullable|string',
            'table_id' => 'nullable|int|exists:tables,id',
        ]);
        if ($validator->fails()) {
            return static::handleValidationErrors($validator);
        }
        $result = new static($data['type'], $data['table_id']);
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
        /** TODO Если добавятся права на просмотр статистики таблиц то тут сделать проверку */
        if (!$this->requestUser->tables()->find($this->table)?->exists()){
            $this->makeError(Errors::TABLE_NOT_FOUND, 404);
        }
    }
}
