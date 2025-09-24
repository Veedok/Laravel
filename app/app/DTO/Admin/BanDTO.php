<?php

namespace App\DTO\Admin;

use App\DTO\AbstractDTO;
use App\Enums\Errors;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use JsonException;

/** DTO для получения графиков */
class BanDTO extends AbstractDTO
{
    /** @var array|string[] Пользователи у которых иммунитет от бана */
    const array DONT_BANDED_USERS = ['veedok18@yandex.ru'];

    /**
     * Закрытый конструктор
     * @param User|int|null $user
     * @param string|null $expired
     * @param string|null $comment
     */
    protected function __construct(
        public User|int|null $user = null,
        public ?string       $expired = null,
        public ?string       $comment = null,
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
            'expired_at' => 'nullable|date',
            'comment' => 'nullable|string|max:500'
        ]);
        if ($validator->fails()) {
            return static::handleValidationErrors($validator);
        }
        $result = new static($data['user_id'], ($data['expired_at'] ?? null), ($data['comment'] ?? null));
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
        in_array($this->user->email, self::DONT_BANDED_USERS, true) && $this->makeError('Данного пользователя забанить не получится', 400);
    }
}
