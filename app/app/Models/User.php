<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/** Модель пользователя
 * @property mixed $pivot
 */
class User extends Authenticatable
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
     * Проверка прав на запись в таблице
     * @param $id
     * @return bool
     */
    public function checkPermission($id): bool
    {
        return $this->tables()
            ->whereHas('transactions', function($query) use ($id) {
                $query->where('id', $id);
            })
            ->exists();
    }

    public function checkTablePermission($id, $permission)
    {
        return $this->tables()->find($id)?->pivot->hasPermission($permission);
    }
}
