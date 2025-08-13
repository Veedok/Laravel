<?php

namespace App\Http\Controllers;

use App\DTO\DestroyDTO;
use App\DTO\TransactionDTO;
use App\DTO\UpdateTransactionDTO;
use App\Services\Transaction;
use Illuminate\Http\JsonResponse;

/** Контроллер для работы с транзакциями (записями в таблице) */
class TransactionController extends Controller
{

    /**
     * Определение зависимостей
     * @param Transaction $transaction
     */
    public function __construct(
        private readonly Transaction  $transaction
    )
    {

    }

    /**
     * Сохранение новой записи
     * @param TransactionDTO $request
     * @return JsonResponse
     */
    public function saveData(TransactionDTO $request): JsonResponse
    {
        return $this->transaction->save($request);
    }

    /**
     * Обновление записи
     * @param UpdateTransactionDTO $request
     * @return JsonResponse
     */
    public function update(UpdateTransactionDTO $request): JsonResponse
    {
        return $this->transaction->update($request);
    }

    /**
     * Удаление записи
     * @param DestroyDTO $request
     * @return JsonResponse
     */
    public function destroy(DestroyDTO $request): JsonResponse
    {
        return $this->transaction->destroy($request);
    }

}
