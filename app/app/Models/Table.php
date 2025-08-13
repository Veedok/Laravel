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

    /**
     * Связь с пользователями
     * @return BelongsToMany
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_tables')
            ->withPivot('role_id');
    }

    /**
     * Связь с транзакциями
     * @return HasMany
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }
}
