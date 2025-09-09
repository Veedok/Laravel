<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use App\Models\User;
use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ChartController extends Controller
{
    public function index()
    {
        /** @var User $user */
        $user = auth()->user();

        // Получаем список таблиц, к которым у пользователя есть доступ
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

    public function getTagStatistics(Request $request)
    {
        $user = $request->user();
        $type = $request->input('type', 'income');
        $tableId = $request->input('table_id', null);

        // Получаем ID таблиц, к которым у пользователя есть доступ
        $userTableIds = DB::table('user_tables')
            ->where('user_id', $user->id)
            ->pluck('table_id');

        $query = DB::table('tags')
            ->join('transaction_tag', 'tags.id', '=', 'transaction_tag.tag_id')
            ->join('transactions', 'transaction_tag.transaction_id', '=', 'transactions.id')
            ->where('tags.user_id', $user->id)
            ->whereIn('transactions.table_id', $userTableIds); // Только таблицы пользователя

        // Фильтр по типу (доход/расход)
        $query->where('transactions.type', $type);

        // Фильтр по конкретной таблице (если указан)
        if ($tableId && in_array($tableId, $userTableIds->toArray())) {
            $query->where('transactions.table_id', $tableId);
        }

        $tagStatistics = $query
            ->select(
                'tags.id',
                'tags.name',
                DB::raw('SUM(transactions.sum) as total_sum'),
                DB::raw('COUNT(transactions.id) as transaction_count')
            )
            ->groupBy('tags.id', 'tags.name')
            ->havingRaw('SUM(transactions.sum) > 0') // Только теги с ненулевой суммой
            ->orderByRaw('SUM(transactions.sum) DESC')
            ->get();

        // Общая сумма для выбранного типа и таблицы
        $totalSum = $tagStatistics->sum('total_sum');

        return response()->json([
            'tagStatistics' => $tagStatistics,
            'totalSum' => $totalSum,
            'type' => $type,
            'tableId' => $tableId
        ]);
    }
}
