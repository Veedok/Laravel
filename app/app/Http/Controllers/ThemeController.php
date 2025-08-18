<?php

namespace App\Http\Controllers;

use App\Traits\ThemeTrait;
use Illuminate\Http\Request;

class ThemeController extends Controller
{
    use ThemeTrait;
    public function toggle(Request $request)
    {
        $theme = $request->theme === 'dark' ? 'dark' : 'light';

        if (auth()->check()) {
            auth()->user()->update(['theme' => $theme]);
        }

        session(['theme' => $theme]);

        return back()->with([
            'theme' => $theme, // Важно: возвращаем обновленную тему
        ]);
    }
}
