<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;
use JsonException;

/**
 * Связь пользователей с таблицами
 * @property mixed $is_owner
 * @property mixed $permissions
 */
class UserTable extends Pivot
{
    /** @var null Отключение времени обновления */
    const null UPDATED_AT = null;

    /** @var null Отключение времени добавления */
    const null CREATED_AT = null;

    /** @var string Таблица в БД    */
    protected $table = 'user_tables';
    protected $casts = [
        'permissions' => 'array',
        'is_owner' => 'boolean'
    ];

    /**
     * Проверка прав пользователя
     * @param string $permission
     * @return bool
     * @throws JsonException
     */
    public function hasPermission(string $permission): bool
    {
        if ($this->is_owner) {
            return $this->is_owner;
        }
        $userPermission = json_decode($this->permissions, true, 512, JSON_THROW_ON_ERROR) ?? [];
        return is_array($userPermission) && in_array($permission, $userPermission, true);
    }

    /**
     * Связь с пользователями
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Связь с таблицами
     * @return BelongsTo
     */
    public function table(): BelongsTo
    {
        return $this->belongsTo(Table::class);
    }
}
