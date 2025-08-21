<?php

namespace App\DTO\Table;

use App\DTO\AbstractDTO;
use App\Enums\Errors;
use App\Enums\Permissions;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use JsonException;

/** DTO для добавления пользователя к таблице */
class AddUserDTO extends AbstractDTO
{

    /**
     * Закрытый конструктор
     * @param int|null $user
     * @param int|null $table
     * @param array $permissions
     */
    protected function __construct(
        public ?int  $user = null,
        public ?int  $table = null,
        public array $permissions = []
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
            'userId' => 'required|integer|exists:users,id',
            'tableId' => 'required|integer|exists:tables,id',
            'permissions' => 'nullable|array',
            'permissions.*' => [
                'required',
                'string',
                'in:' . implode(',', Permissions::getValues()),
            ],
        ]);
        if ($validator->fails()) {
            return static::handleValidationErrors($validator);
        }
        $result = new static($data['userId'], $data['tableId'], $data['permissions']);
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
        if (!$this->requestUser->checkTablePermission($this->table, 'invite')) {
            $this->makeError(Errors::ACCESS_DENIED, 403);
        }
    }
}
