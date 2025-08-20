<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Модель таблиц
 * @property mixed $id
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

    public function getUserPermissions($userId)
    {

        /** @var User $user */
        $user = $this->users()
            ->where('user_id', $userId)
            ->first();
        return [
            'is_owner' => $user->pivot->is_owner,
            'permissions' => !$user->pivot->is_owner ? json_decode($user->pivot->permissions, true) : []
        ];
    }

    public function getOwner($id = false)
    {
        $relation = $this->ownerTable()->where('is_owner', true)->first();
        return $id ? $relation->user->id : $relation->user;
    }
}
