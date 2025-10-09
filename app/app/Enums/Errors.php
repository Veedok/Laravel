<?php

namespace App\Enums;

/** Перечисление ошибок */
enum Errors
{
    const string SERVER_ERROR = 'server_error';
    const string VALIDATION_ERROR = 'valid_error';
    const string TRANSACTION_NOT_FOUND = 'transaction_not_found';
    const string NOTING_CHANGE = 'noting_change';
    const string TABLE_NOT_FOUND = 'table_not_found';
    const string ACCESS_DENIED = 'access_denied';
    const string KEY_AND_SALT_REQUIRED = 'key_and_salt_required';
    const string TABLE_IS_NOT_ENCRYPTED = 'table_is_not_encrypted';
}
