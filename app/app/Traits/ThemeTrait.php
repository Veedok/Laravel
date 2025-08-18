<?php

namespace App\Traits;

trait ThemeTrait
{
    protected function setTheme(string $theme)
    {
        if (!in_array($theme, ['light', 'dark'])) {
            $theme = 'light';
        }

        if (auth()->check()) {
            auth()->user()->update(['theme' => $theme]);
        }

        session(['theme' => $theme]);
    }

    public function getTheme()
    {
        if (auth()->check() && auth()->user()->theme) {
            return auth()->user()->theme;
        }

        return session('theme', 'light');
    }

    protected function shareTheme()
    {
        return [
            'theme' => $this->getTheme(),
            'isDark' => $this->getTheme() === 'dark'
        ];
    }
}
