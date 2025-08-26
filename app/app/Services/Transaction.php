<?php

namespace App\Services;

use App\DTO\DestroyDTO;
use App\DTO\TransactionDTO;
use App\DTO\UpdateTransactionDTO;
use App\Models\Table;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

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
        /** @var Table $table */
        $table = $request->requestUser->tables()->find($request->table);
        /** @var \App\Models\Transaction $transaction */
        $transaction = $table?->transactions()->create([
            "name" => $request->name,
            "type" => $request->changeBalance ? 'income' : 'expense',
            "sum" => $request->sum,
            "date" => $request->date,
        ]);
        !empty($request->tags) && $this->tagsSave($request->tags, $request->requestUser, $transaction);
        return response()->json(['status' => 'ok', 'id' => $transaction->id]);
    }

    /**
     * Изменение записи
     * @param UpdateTransactionDTO $request
     * @return JsonResponse
     */
    public function update(UpdateTransactionDTO $request): JsonResponse
    {
        $this->tagsSave($request->tags, $request->requestUser, $request->transaction);
        (isset($request->name)) && $request->transaction->name = $request->name;
        (isset($request->date)) && $request->transaction->date = $request->date;
        (isset($request->sum)) && $request->transaction->sum = $request->sum;
        if (isset($request->changeBalance)) {
            $request->transaction->type = $request->changeBalance ? 'income' : 'expense';
        }
        $request->transaction->save();
        return response()->json(['status' => 'ok', 'id' => $request->transaction->id]);
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

    private function tagsSave(array $tags, User $user, \App\Models\Transaction $transaction)
    {
        $tagIds = [];
        foreach ($tags as $tagName) {
            $cleanTagName = Str::lower(trim($tagName, "# \t\n\r\0\x0B"));
            if (!empty($cleanTagName)) {
                $tag = Tag::firstOrCreate(
                    ['name' => $cleanTagName, 'user_id' => $user->id],
                    ['name' => $cleanTagName, 'user_id' => $user->id]
                );
                $tagIds[] = $tag->id;
            }
        }
        $transaction->tags()->sync($tagIds);
        $user->unusedTags();
    }
}
