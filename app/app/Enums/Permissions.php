<?php

namespace App\Enums;

enum Permissions: string
{
    case INVITE = 'invite';
    case ADD = 'addTransaction';
    case REMOVE_TABLE = 'removeTable';
    case CHANGE_USER_PERMISSIONS = 'changeUsers';

    public static function getDescriptions(): array
    {
        return [
            self::INVITE->value => 'Приглашать других пользователей',
            self::ADD->value => 'Добавлять записи',
            self::REMOVE_TABLE->value => 'Удаление таблицы',
            self::CHANGE_USER_PERMISSIONS->value => 'Изменение прав пользователей',
        ];
    }

    public static function getValues(): array
    {
        return array_column(self::cases(), 'value');
    }
}


