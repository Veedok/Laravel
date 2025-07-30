<?php

namespace App\Enums;

enum Errors
{

    const string SERVER_ERROR = 'server_error';
    const string VALIDATION_ERROR = 'valid_error';
    const string TRANSACTION_NOT_FOUND = 'transaction_not_found';
    const string NOTING_CHANGE = 'noting_change';
}
