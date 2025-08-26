<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'user_id'];

    /**
     * Транзакции, принадлежащие тегу.
     */
    public function transactions(): BelongsToMany
    {
        return $this->belongsToMany(Transaction::class, 'transaction_tag');
    }

    /**
     * Пользователь-владелец этого тега.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
