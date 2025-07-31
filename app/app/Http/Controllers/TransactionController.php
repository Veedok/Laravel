<?php

namespace App\Http\Controllers;

use App\DTO\DestroyDTO;
use App\DTO\TransactionDTO;
use App\DTO\UpdateTransactionDTO;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function authForm()
    {
        $transactions = auth()->user()?->transactions()->get();
        return Inertia::render('Dashboard', [
            'csrfToken' => csrf_token(),
            'transactions' => $transactions->map(function ($item) {
                return [
                    'id' => $item->id,
                    'title' => $item->name,
                    'changeBalance' => $item->type === 'income',
                    'sum' => $item->sum,
                    'date' => $item->date->format('d.m.Y')
                ];
            })
        ]);
    }

    public function saveData(TransactionDTO $request)
    {
        $transaction = $request->requestUser->transactions()->create([
            "name" => $request->name,
            "type"=>$request->changeBalance ? 'income' : 'expense',
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
        if (isset($request->changeBalance)){
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
}
