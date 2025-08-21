<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Traits\ThemeTrait;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/** Контроллер для выставления тем (светлая, темная) */
class ThemeController extends Controller
{
    use ThemeTrait;

    /**
     * Метод возвращает тему и устанавливает тему пользователю
     * @param Request $request
     * @return RedirectResponse
     */
    public function toggle(Request $request): RedirectResponse
    {
        $theme = 'dark' === $request->theme ? 'dark' : 'light';
        if (auth()->check()) {
            /** @var User $user */
            $user = auth()->user();
            $user->update(['theme' => $theme]);
        }
        session(['theme' => $theme]);
        return back()->with([
            'theme' => $theme
        ]);
    }
}
