<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property mixed $sum
 * @property mixed $name
 * @property mixed $date
 * @property mixed|string $type
 * @method static find(int|null $id)
 */
class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'type',
        'sum',
        'date'
    ];

    protected $casts = [
        'type' => 'string', // Для ENUM поля
        'date' => 'datetime',
        'sum' => 'float'
    ];

    /**
     * Получить пользователя, которому принадлежит транзакция
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
