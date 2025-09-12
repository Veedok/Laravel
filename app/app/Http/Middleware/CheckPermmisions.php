<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermmisions
{
    /**
     * Handle an incoming request.
     *
     * @param \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response) $next
     */
    public function handle(Request $request, Closure $next, string $perm): Response
    {
        if (!$request->user()->can($perm)) {
            if ($perm === 'view_admin_panel') {
                return redirect()->route('dashboard')->with('error', 'Нет прав');
            }
            $msg = match ($perm) {
                'ban_users' => 'блокировки пользователей',
                'unban_users' => 'разблокировки пользователей',
                default => 'данного действия',
            };
            abort(Response::HTTP_FORBIDDEN, sprintf("У вас недостаточно прав для %s", mb_strtolower($msg)));
        }
        return $next($request);
    }
}
