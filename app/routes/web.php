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

Route::get('/dashboard', [TablesController::class, 'mainPage'])->middleware(['auth', 'verified'])->name('dashboard');
Route::put('/table', [TablesController::class, 'newTable'])->middleware(['auth', 'verified']);
Route::post('/table', [TablesController::class, 'getTableData'])->middleware(['auth', 'verified'])->name('tableData');
Route::get('/tableControl', [TablesController::class, 'getTablePage'])->middleware(['auth', 'verified'])->name('tableControl');
Route::patch('/tableControl', [TablesController::class, 'editTable'])->middleware(['auth', 'verified'])->name('tableEdit');
Route::delete('/tableControl', [TablesController::class, 'remove'])->middleware(['auth', 'verified'])->name('tableDelete');
Route::get('/searchUser', [TablesController::class, 'userSearch'])->middleware(['auth', 'verified'])->name('userSearch');
Route::post('/tableControl', [TablesController::class, 'share'])->middleware(['auth', 'verified'])->name('tableShare');
Route::post('/tablesUsers', [PermissionsController::class, 'getUsers'])->middleware(['auth', 'verified'])->name('tableUsers');
Route::patch('/tablesUsers', [PermissionsController::class, 'updatePermissions'])->middleware(['auth', 'verified'])->name('tableUpdatePermissions');
Route::delete('/tablesUsers', [PermissionsController::class, 'removeUser'])->middleware(['auth', 'verified'])->name('tableRemoveUser');
Route::post('/toggle-theme', [ThemeController::class, 'toggle'])->middleware('web');

Route::post('/transactions', [TransactionController::class, 'saveData'])->middleware(['auth', 'verified'])->name('saveData');
Route::put('/transactions', [TransactionController::class, 'update'])->middleware(['auth', 'verified'])->name('updateData');
Route::delete('/transactions', [TransactionController::class, 'destroy'])->middleware(['auth', 'verified'])->name('deleteData');
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/charts', [ChartController::class, 'index'])->name('charts.index');
    Route::post('/api/charts/tag-statistics', [ChartController::class, 'getTagStatistics'])->name('api.charts.tag-statistics');
});

// Admin routes
Route::middleware(['auth', 'can:view_admin_panel'])->prefix('admin')->group(function () {
    Route::get('/users', [UserController::class, 'index'])->name('admin.users.index');
    Route::post('/users/ban', [UserController::class, 'ban'])->name('admin.users.ban');
    Route::post('/users/unban', [UserController::class, 'unban'])->name('admin.users.unban');
});
require __DIR__.'/auth.php';
