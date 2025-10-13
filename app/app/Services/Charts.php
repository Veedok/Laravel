<?php

namespace App\Services;

use App\DTO\ChartDTO;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/** Сервис для работы с графиками */
class Charts
{
    /**
     * Получение страницы графиков
     * @return array
     */
    public function index(): array
    {
        /** @var User $user */
        $user = auth()->user();
        $tables = DB::table('user_tables')
            ->join('tables', 'user_tables.table_id', '=', 'tables.id')
            ->where('user_tables.user_id', $user->id)
            ->select('tables.id', 'tables.name')
            ->orderBy('tables.name')
            ->get();
        return [
            'theme' => $user->theme,
            'tables' => $tables
        ];
    }

    /**
     * Формирование данных для построения графиков
     * @param ChartDTO $request
     * @return array
     */
    public function getStatistic(ChartDTO $request): array
    {
        $userTable = $request->table->userTables()->where('user_id', $request->requestUser->id)->first();
        $result = [
            'type' => $request->type,
            'tableId' => $request->table?->id,
            "crypt" => !empty($userTable->key) && !empty($userTable->salt),
            "cryptKey" => $userTable->key,
            "cryptSalt" => $userTable->salt
        ];
        $query = DB::table('tags')
            ->join('transaction_tag', 'tags.id', '=', 'transaction_tag.tag_id')
            ->join('transactions', 'transaction_tag.transaction_id', '=', 'transactions.id')
            ->where('tags.user_id', $request->requestUser->id)
            ->where('transactions.table_id', $request->table->id);
        $query->where('transactions.type', $request->type);
        $tagStatistics = $query
            ->select(
                'tags.id',
                'tags.name',
                'transactions.sum as sum',
            )
            ->get()
            ->map(function($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'sum' => $item->sum
                ];
            })
            ->toArray();
        return array_merge($result, ['items' => $tagStatistics]);
    }
}
