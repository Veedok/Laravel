<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\UserController;

Route::middleware(['auth:sanctum', 'can:view_admin_panel'])->group(function () {
});
