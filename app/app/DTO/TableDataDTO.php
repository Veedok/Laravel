<?php

namespace App\DTO;

use App\Enums\Errors;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/** DTO для получения данных таблицы */
class TableDataDTO extends AbstractDTO
{
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
            'tableId' => 'required|integer|exists:tables,id',
        ]);
        if ($validator->fails()) {
            return static::handleValidationErrors($validator);
        }
        $result = new static($data['tableId']);
        /** @var User $user */
        $user = auth()->user();
        $user !== null && $result->setRequestUser($user);
        $result = $result->validate();
        !$result->hasError() && $request->session()->put('ActiveTable', $result->id);
        return $result;
    }

    /**
     * Валидация
     * @return void
     */
    protected function selfValidate(): void
    {
        if (!$this->requestUser->checkTableAccess($this->id)) {
            $this->makeError(Errors::TABLE_NOT_FOUND, 400);
        }
    }
}
