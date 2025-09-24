<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Traits\ThemeTrait;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        $sharedData = [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'admin' => $user instanceof User ? $user->hasRole('admin') : false,
            'theme' => (new class { use ThemeTrait; })->getTheme(),
        ];

        // Правильное получение ошибок из сессии
        $sessionErrors = $request->session()->get('errors');

        if ($sessionErrors instanceof \Illuminate\Support\ViewErrorBag) {
            $sharedData['errors'] = $sessionErrors->getBag('default')->toArray();
        } elseif (is_array($sessionErrors)) {
            $sharedData['errors'] = $sessionErrors;
        } else {
            $sharedData['errors'] = (object) [];
        }

        return $sharedData;
    }
}
