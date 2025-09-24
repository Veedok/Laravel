<?php

use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\ChartController;
use App\Http\Controllers\PermissionsController;
use App\Http\Controllers\TablesController;
use App\Http\Controllers\ThemeController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
});
Route::middleware(['banned', 'auth', 'verified'])->group(function () {
    Route::get('/dashboard', [TablesController::class, 'mainPage'])->name('dashboard');
    Route::put('/table', [TablesController::class, 'newTable']);
    Route::post('/table', [TablesController::class, 'getTableData'])->name('tableData');
    Route::get('/tableControl', [TablesController::class, 'getTablePage'])->name('tableControl');
    Route::patch('/tableControl', [TablesController::class, 'editTable'])->name('tableEdit');
    Route::delete('/tableControl', [TablesController::class, 'remove'])->name('tableDelete');
    Route::post('/tableControl', [TablesController::class, 'share'])->name('tableShare');
    Route::get('/searchUser', [TablesController::class, 'userSearch'])->name('userSearch');
    Route::post('/tablesUsers', [PermissionsController::class, 'getUsers'])->name('tableUsers');
    Route::patch('/tablesUsers', [PermissionsController::class, 'updatePermissions'])->name('tableUpdatePermissions');
    Route::delete('/tablesUsers', [PermissionsController::class, 'removeUser'])->name('tableRemoveUser');
    Route::post('/toggle-theme', [ThemeController::class, 'toggle'])->middleware('web');
    Route::post('/transactions', [TransactionController::class, 'saveData'])->name('saveData');
    Route::put('/transactions', [TransactionController::class, 'update'])->name('updateData');
    Route::delete('/transactions', [TransactionController::class, 'destroy'])->name('deleteData');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/charts', [ChartController::class, 'index'])->name('charts.index');
    Route::post('/api/charts/tag-statistics', [ChartController::class, 'getTagStatistics'])->name('api.charts.tag-statistics');
    Route::get('/users', [UserController::class, 'index'])->name('admin.users.index')->middleware(['can:view_admin_panel']);
    Route::post('/users/ban', [UserController::class, 'ban'])->name('admin.users.ban')->middleware(['can:ban_users']);
    Route::post('/users/unban', [UserController::class, 'unban'])->name('admin.users.unban')->middleware(['can:unban_users']);
});

require __DIR__ . '/auth.php';
