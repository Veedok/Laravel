<?php

namespace App\Models;

use Closure;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticate;
use Illuminate\Notifications\Notifiable;
use JsonException;

/** Модель пользователя
 * @property mixed $pivot
 * @property mixed|null $tables
 * @property mixed $id
 * @property mixed $theme
 * @method static where(Closure $param)
 * @method static find(int|null $user)
 */
class User extends Authenticate
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Изменяемые поля
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'theme',
    ];

    /**
     * Скрытые поля
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $attributes = [
        'theme' => 'light',
    ];
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Связь с таблицами
     * @return BelongsToMany
     */
    public function tables(): BelongsToMany
    {
        return $this->belongsToMany(Table::class, 'user_tables')
            ->using(UserTable::class)
            ->withPivot(['permissions', 'is_owner']);
    }

    /**
     * Проверка прав на таблицу
     * @param $id
     * @return bool
     */
    public function checkTableAccess($id): bool
    {
        return $this->tables()->where('tables.id', $id)->exists();
    }

    /**
     * Проверка прав
     * @param int $id ID таблицы
     * @param string $permission Требуемые права
     * @return bool|null
     * @throws JsonException
     */
    public function checkTablePermission(int $id, string $permission): ?bool
    {
        $relation = $this->tables()->find($id)?->pivot;
        /** @var UserTable $relation */
        return $relation->hasPermission($permission);
    }
}
