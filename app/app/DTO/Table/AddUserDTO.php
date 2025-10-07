<?php

namespace App\DTO\Table;

use App\DTO\AbstractDTO;
use App\Enums\Errors;
use App\Enums\Permissions;
use App\Models\Table;
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
        public ?int           $user = null,
        public Table|int|null $table = null,
        public array          $permissions = [],
        public ?string        $key = null,
        public ?string        $salt = null,
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
            'key' => 'nullable|string',
            'salt' => 'nullable|string',
        ]);
        if ($validator->fails()) {
            return static::handleValidationErrors($validator);
        }
        $result = new static($data['userId'], $data['tableId'], $data['permissions'], ($data['key'] ?? null), ($data['salt'] ?? null));
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
        $this->table = $this->findModel($this->table, 'table');
        if (!$this->requestUser->checkTablePermission($this->table?->id, 'invite')) {
            $this->makeError(Errors::ACCESS_DENIED, 403);
        }
        $owner = $this->table->userTables()->where('is_owner', true)->first();
        if (($this->key === null || $this->salt === null) && !empty($owner->key)) {
            $this->makeError(Errors::KEY_AND_SALT_REQUIRED, 400);
        }
    }
}
