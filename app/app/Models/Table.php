<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property mixed $id
 */
class Table extends Model
{

    protected $fillable = [
        'name',
    ];
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_tables')
            ->withPivot('role_id')
            ->withTimestamps(false);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
