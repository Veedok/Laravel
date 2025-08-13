<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/** Модель пользователя */
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
    ];

    /**
     * Скрытые поля
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
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
        return $this->belongsToMany(Table::class, 'user_tables')->withPivot('role_id');
    }

    /**
     * Проверка прав на таблицу
     * @param $id
     * @return bool
     */
    public function checkPermissions($id): bool
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
}
