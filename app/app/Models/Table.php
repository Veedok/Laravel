<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use JsonException;

/**
 * Модель таблиц
 * @property mixed $id
 * @property mixed $name
 * @property mixed $transactions
 * @method static find(int|null $id)
 */
class Table extends Model
{

    /** @var string[] Изменяемые поля */
    protected $fillable = [
        'name',
    ];

    public function ownerTable(): HasMany
    {
        return $this->hasMany(UserTable::class);
    }

    /**
     * Связь с пользователями
     * @return BelongsToMany
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_tables')
            ->using(UserTable::class)
            ->withPivot(['permissions', 'is_owner']);
    }

    /**
     * Связь с транзакциями
     * @return HasMany
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Возвращает права пользователя
     * @param $userId
     * @return array
     * @throws JsonException
     */
    public function getUserPermissions($userId): array
    {
        /** @var User $user */
        $user = $this->users()
            ->where('user_id', $userId)
            ->first();
        return [
            'is_owner' => $user->pivot->is_owner,
            'permissions' => !$user->pivot->is_owner ? json_decode($user->pivot->permissions, true, 512, JSON_THROW_ON_ERROR) : []
        ];
    }

    /**
     * Возвращает владельца таблицы
     * @param bool $id Флаг, если установлен в true вернет только ID если false модель пользователя
     * @return mixed
     */
    public function getOwner(bool $id = false): mixed
    {
        $relation = $this->ownerTable()->where('is_owner', true)->first();
        return $id ? $relation->user->id : $relation->user;
    }
}
