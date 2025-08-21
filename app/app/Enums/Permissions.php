<?php

namespace App\Enums;

/** Перечисление прав */
enum Permissions: string
{
    case INVITE = 'invite';
    case ADD_TRANSACTION = 'addTransaction';
    case REMOVE_TABLE = 'removeTable';
    case CHANGE_USER_PERMISSIONS = 'changeUsers';
    case EDIT_TRANSACTION = 'editTransactions';
    case DEL_TRANSACTION = 'deleteTransactions';
    case EDIT_TABLE = 'editTables';


    /**
     * Метод возвращает массив прав с их описанием
     * @return string[]
     */
    public static function getDescriptions(): array
    {
        return [
            self::ADD_TRANSACTION->value => 'Добавлять записи',
            self::EDIT_TRANSACTION->value => 'Изменять записи',
            self::DEL_TRANSACTION->value => 'Удалять записи',
            self::INVITE->value => 'Приглашать других пользователей',
            self::CHANGE_USER_PERMISSIONS->value => 'Изменение прав пользователей',
            self::EDIT_TABLE->value => 'Изменять имя таблицы',
            self::REMOVE_TABLE->value => 'Удаление таблицы',

        ];
    }

    /**
     * Возвращает массив существующих прав
     * @return array
     */
    public static function getValues(): array
    {
        return array_column(self::cases(), 'value');
    }
}


