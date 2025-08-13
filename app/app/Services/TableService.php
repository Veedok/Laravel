<?php

namespace App\Services;

use App\DTO\NewTableDTO;
use App\DTO\TableDataDTO;
use App\Models\Table;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

/** Сервис для работы с таблицами */
class TableService
{

    /**
     * Метод отображения главной страницы
     * @return Response
     */
    public function getMainPage(): Response
    {
        $tables = auth()->user()?->tables
            ->mapWithKeys(function ($table, $index) {
                return [
                    $table->id => [
                        'name' => $table->name,
                        'active' => $index === 0
                    ]
                ];
            })
            ->all();
        return Inertia::render('Dashboard', [
            'csrfToken' => csrf_token(),
            'tables' => $tables,
        ]);
    }

    /**
     * Получение данных определенной таблицы
     * @param TableDataDTO $request
     * @return JsonResponse
     */
    public function getTableData(TableDataDTO $request): JsonResponse
    {
        $transactions = Table::find($request->id)->transactions;
        $result = [];
        foreach ($transactions as $item) {
            $result[] = [
                'id' => $item->id,
                'title' => $item->name,
                'changeBalance' => $item->type === 'income',
                'sum' => $item->sum,
                'date' => $item->date->format('d.m.Y')
            ];
        }
        return response()->json($result);
    }

    /**
     * Создание новой таблицы
     * @param NewTableDTO $request
     * @return array
     */
    public function newTable(NewTableDTO $request): array
    {
        /** @var Table $table */
        $table = $request->requestUser->tables()->create([
            'name' => $request->name
        ], [
            'role_id' => 1
        ]);
        return ['id' => $table->id];
    }
}
