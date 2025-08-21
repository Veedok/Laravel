<?php

namespace App\Traits;

use App\Models\User;
use Illuminate\Foundation\Application;
use Illuminate\Session\SessionManager;

/** Трейт для работы с темами */
trait ThemeTrait
{

    /**
     * Метод изменения темы
     * @param string $theme
     * @return void
     */
    protected function setTheme(string $theme): void
    {
        if (!in_array($theme, ['light', 'dark'])) {
            $theme = 'light';
        }
        if (auth()->check()) {
            /** @var User $user */
            $user = auth()->user();
            $user->update(['theme' => $theme]);
        }
        session(['theme' => $theme]);
    }

    /**
     * Получения темы пользователя
     * @return Application|SessionManager|mixed|object|null
     */
    public function getTheme(): mixed
    {
        if (auth()->check()) {
            /** @var User $user */
            $user = auth()->user();
                if($user->theme){
                    return $user->theme;
                }
        }
        return session('theme', 'light');
    }

    /**
     * Получения массива с информацией о теме
     * @return array
     */
    protected function shareTheme(): array
    {
        return [
            'theme' => $this->getTheme(),
            'isDark' => $this->getTheme() === 'dark'
        ];
    }
}
