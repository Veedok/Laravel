<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function authForm()
    {
        return inertia('Dashboard', [
            'transactions' => [
                [
                    'title' => 'Title 1',
                    'changeBalance' => false,
                    'sum' => 2500.23,
                    'date' => '25.07.2025'
                ],
                [
                    'title' => 'Title 2',
                    'changeBalance' => false,
                    'sum' => 6700.23,
                    'date' => '23.07.2025'
                ]
            ]
        ]);
    }

    public function saveData(Request $request)
    {
        $c = 1;
    }
}
