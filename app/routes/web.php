<?php

use App\Http\Controllers\TransactionController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});
Route::put('/table', [TransactionController::class, 'newTable'])->middleware(['auth', 'verified']);
Route::post('/myEndpoint', [TransactionController::class, 'getTableData'])->middleware(['auth', 'verified']);
Route::get('/dashboard', [TransactionController::class, 'dashboard'])->middleware(['auth', 'verified'])->name('dashboard');
Route::post('/transactions', [TransactionController::class, 'saveData'])->middleware(['auth', 'verified'])->name('saveData');
Route::put('/transactions', [TransactionController::class, 'update'])->middleware(['auth', 'verified'])->name('updateData');
Route::delete('/transactions', [TransactionController::class, 'destroy'])->middleware(['auth', 'verified'])->name('deleteData');
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
