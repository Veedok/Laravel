<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Модель транзакции
 * @property mixed $sum
 * @property mixed $name
 * @property mixed $date
 * @property mixed|string $type
 * @property mixed $id
 * @method static find(int|null $id)
 */
class Transaction extends Model
{
    use HasFactory;

    /** @var string[] Изменяемые поля */
    protected $fillable = [
        'user_id',
        'name',
        'type',
        'sum',
        'date'
    ];

    protected $casts = [
        'type' => 'string',
        'date' => 'datetime',
        'sum' => 'float'
    ];

    /**
     * Связь с таблицей
     */
    public function table(): BelongsTo
    {
        return $this->belongsTo(Table::class);
    }
}
