<?php

namespace App\Services;

use App\DTO\DestroyDTO;
use App\DTO\NewTableDTO;
use App\DTO\TableDataDTO;
use App\DTO\TransactionDTO;
use App\DTO\UpdateTransactionDTO;
use App\Models\Table;
use Inertia\Inertia;

class TableService
{

    public function getTable()
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

    public function save(TransactionDTO $request)
    {
        $transaction = $request->requestUser->tables()->find($request->table)?->transactions()->create([
            "name" => $request->name,
            "type" => $request->changeBalance ? 'income' : 'expense',
            "sum" => $request->sum,
            "date" => $request->date,
        ]);
        return response()->json(['status' => 'ok', 'id' => $transaction->id]);
    }

    public function update(UpdateTransactionDTO $request)
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

    public function destroy(DestroyDTO $request)
    {
        $request->getTransaction()->delete();
        return response()->json(['status' => 'ok']);
    }

    public function getTableData(TableDataDTO $request)
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
     * @param NewTableDTO $request
     * @return array
     */
    public function newTable(NewTableDTO $request): array
    {
        $table = $request->requestUser->tables()->create([
            'name' => $request->name
        ], [
            'role_id' => 1
        ]);
        return ['id' => $table->id];
    }
}
