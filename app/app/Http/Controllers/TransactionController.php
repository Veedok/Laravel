<?php

namespace App\Http\Controllers;

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
        $request->requestUser->transactions()->create([
            "name" => $request->name,
            "type"=>$request->changeBalance ? 'income' : 'expense',
            "sum" => $request->sum,
            "date" => $request->date,
        ]);
        return redirect()->route('dashboard')->with('success', 'Операция выполнена');
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
        return back()->with('success', 'Операция выполнена успешно');
    }

    public function destroy()
    {
        return back();
    }
}
