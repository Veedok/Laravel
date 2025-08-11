<?php

namespace App\Services;

use App\DTO\DestroyDTO;
use App\DTO\TableDataDTO;
use App\DTO\TransactionDTO;
use App\DTO\UpdateTransactionDTO;
use App\Models\Table;
use Inertia\Inertia;

class TableService
{

    public function getTable()
    {
        $tables = [];
        foreach (auth()->user()?->tables as $table) {
            $tables[$table->id] = [
                'name' => $table->name,
                'active' => true
            ];
        }
        return Inertia::render('Dashboard', [
            'csrfToken' => csrf_token(),
            'tables' => $tables,

        ]);
    }

    public function save(TransactionDTO $request)
    {
        $transaction = $request->requestUser->transactions()->create([
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
        foreach ($transactions as $item){
            $result[] = [
                'id' => $item->id,
                'title' => $item->name,
                'changeBalance' => $item->type === 'income',
                'sum' => $item->sum,
                'date' => $item->date->format('d.m.Y')
            ];
        }
//        $result = $transactions->map(function ($item) {
//            return [
//                'id' => $item->id,
//                'title' => $item->name,
//                'changeBalance' => $item->type === 'income',
//                'sum' => $item->sum,
//                'date' => $item->date->format('d.m.Y')
//            ];
//        });
        return response()->json($result);
    }
}
