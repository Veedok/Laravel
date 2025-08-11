<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Table extends Model
{
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
