<?php

use App\Http\Controllers\TablesController;
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

Route::post('/transactions', [TransactionController::class, 'saveData'])->middleware(['auth', 'verified'])->name('saveData');
Route::put('/transactions', [TransactionController::class, 'update'])->middleware(['auth', 'verified'])->name('updateData');
Route::delete('/transactions', [TransactionController::class, 'destroy'])->middleware(['auth', 'verified'])->name('deleteData');
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
