<?php

namespace App\Services;

use App\DTO\DestroyDTO;
use App\DTO\TransactionDTO;
use App\DTO\UpdateTransactionDTO;
use Illuminate\Http\JsonResponse;

/** Сервис для работы с записями таблицы */
class Transaction
{
    /**
     * Создание записи в таблице
     * @param TransactionDTO $request
     * @return JsonResponse
     */
    public function save(TransactionDTO $request): JsonResponse
    {
        $transaction = $request->requestUser->tables()->find($request->table)?->transactions()->create([
            "name" => $request->name,
            "type" => $request->changeBalance ? 'income' : 'expense',
            "sum" => $request->sum,
            "date" => $request->date,
        ]);
        return response()->json(['status' => 'ok', 'id' => $transaction->id]);
    }

    /**
     * Изменение записи
     * @param UpdateTransactionDTO $request
     * @return JsonResponse
     */
    public function update(UpdateTransactionDTO $request): JsonResponse
    {
        (isset($request->name)) && $request->transaction->name = $request->name;
        (isset($request->date)) && $request->transaction->date = $request->date;
        (isset($request->sum)) && $request->transaction->sum = $request->sum;
        if (isset($request->changeBalance)) {
            $request->transaction->type = $request->changeBalance ? 'income' : 'expense';
        }
        $request->transaction->save();
        return response()->json(['status' => 'ok']);
    }

    /**
     * Удаление записи
     * @param DestroyDTO $request
     * @return JsonResponse
     */
    public function destroy(DestroyDTO $request): JsonResponse
    {
        $request->getTransaction()->delete();
        return response()->json(['status' => 'ok']);
    }
}
