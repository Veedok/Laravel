<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserTable extends Model
{
    /** @var null Отключение времени обновления */
    const null UPDATED_AT = null;

    /** @var null Отключение времени добавления */
    const null CREATED_AT = null;

    /**
     * Изменяемые поля
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];
}
