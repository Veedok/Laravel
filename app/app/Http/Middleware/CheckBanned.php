<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\MessageBag;
use Illuminate\Support\ViewErrorBag;
use Symfony\Component\HttpFoundation\Response;

class CheckBanned
{
    /**
     * Handle an incoming request.
     *
     * @param \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response) $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        /** @var null|User $user */
        $user = auth()->check() ? auth()->user() : null;
        if ($user !== null && $user->is_banned) {
            $message = $user->getBannString();
            auth()->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            $request->session()->flash(
                'errors',
                new ViewErrorBag()
            );
            $request->session()->get('errors')->put('default', new MessageBag([
                'email' => !empty($message) ? $message : "Ваш аккаунт заблокирован",
            ]));
            return redirect()->route('login');
        }

        return $next($request);
    }
}
