<?php

namespace App\Services;

use App\DTO\ChartDTO;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/** Сервис для работы с графиками */
class Charts
{
    /**
     * Получение страницы графиков
     * @return Response
     */
    public function index(): Response
    {
        /** @var User $user */
        $user = auth()->user();
        $tables = DB::table('user_tables')
            ->join('tables', 'user_tables.table_id', '=', 'tables.id')
            ->where('user_tables.user_id', $user->id)
            ->select('tables.id', 'tables.name')
            ->orderBy('tables.name')
            ->get();
        return Inertia::render('Charts/Index', [
            'theme' => $user->theme,
            'tables' => $tables
        ]);
    }

    /**
     * Формирование данных для построения графиков
     * @param ChartDTO $request
     * @return array
     */
    public function getStatistic(ChartDTO $request): array
    {
        $result = [
            'type' => $request->type,
            'tableId' => $request->table
        ];
        $userTableIds = DB::table('user_tables')
            ->where('user_id', $request->requestUser->id)
            ->pluck('table_id');
        $query = DB::table('tags')
            ->join('transaction_tag', 'tags.id', '=', 'transaction_tag.tag_id')
            ->join('transactions', 'transaction_tag.transaction_id', '=', 'transactions.id')
            ->where('tags.user_id', $request->requestUser->id)
            ->whereIn('transactions.table_id', $userTableIds);
        $query->where('transactions.type', $request->type);
        if ($request->table && in_array($request->table, $userTableIds->toArray(), true)) {
            $query->where('transactions.table_id', $request->table);
        }
        $tagStatistics = $query
            ->select(
                'tags.id',
                'tags.name',
                DB::raw('SUM(transactions.sum) as total_sum'),
                DB::raw('COUNT(transactions.id) as transaction_count')
            )
            ->groupBy('tags.id', 'tags.name')
            ->havingRaw('SUM(transactions.sum) > 0')
            ->orderByRaw('SUM(transactions.sum) DESC')
            ->get();
        return array_merge($result, ['tagStatistics' => $tagStatistics, 'totalSum' => $tagStatistics->sum('total_sum')]);
    }
}
