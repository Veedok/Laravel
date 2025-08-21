<?php

namespace App\DTO\Table;

use App\DTO\AbstractDTO;
use App\Enums\Errors;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use JsonException;

/** DTO для изменения прав пользователя */
class ChangePermissionDTO extends AbstractDTO
{

    /**
     * Закрытый конструктор
     * @param int|null $user
     * @param int|null $table
     * @param string|null $permission
     * @param bool|null $flag
     */
    protected function __construct(
        public ?int    $user = null,
        public ?int    $table = null,
        public ?string $permission = null,
        public ?bool   $flag = null
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
            'tableId' => 'required|exists:tables,id',
            'userId' => 'required|exists:users,id',
            'permission' => 'required|string',
            'value' => 'required|boolean',
        ]);
        if ($validator->fails()) {
            return static::handleValidationErrors($validator);
        }
        $result = new static($data['userId'], $data['tableId'], $data['permission'], $data['value']);
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
        if (!$this->requestUser->checkTablePermission($this->table, 'changeUsers')) {
            $this->makeError(Errors::ACCESS_DENIED, 403);
        }
    }
}
