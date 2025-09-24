<?php

namespace App\DTO\Admin;

use App\DTO\AbstractDTO;
use App\Enums\Errors;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use JsonException;

/** DTO для разблокировки пользователя */
class UnbanDTO extends AbstractDTO
{

    /**
     * Закрытый конструктор
     * @param User|int|null $user
     */
    protected function __construct(
        public User|int|null $user = null,
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
            'user_id' => 'required|int|exists:users,id',
        ]);
        if ($validator->fails()) {
            return static::handleValidationErrors($validator);
        }
        $result = new static($data['user_id']);
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
        $this->user = $this->findModel($this->user, 'user');
    }
}
