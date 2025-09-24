<?php

namespace App\Services\Admin;

use App\DTO\Admin\BanDTO;
use App\DTO\Admin\UnbanDTO;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

/** Класс администрирования сайта */
class Ban
{
    /**
     * Отображение страницы админа
     * @return Response
     */
    public function adminPage(): Response
    {
        $user = auth()->check() ? auth()->user() : null;
        if ($user instanceof User) {
            $requestUserMail = $user->email;
            $exclude = !in_array($requestUserMail, BanDTO::DONT_BANDED_USERS, true) ? array_merge(BanDTO::DONT_BANDED_USERS, []) : BanDTO::DONT_BANDED_USERS;
        }
        return Inertia::render('Admin/Users/Index', [
            'users' => User::with('roles')
                ->select('id', 'name', 'email', 'banned_until', 'created_at')
                ->whereNotIn('email', !empty($exclude) ? $exclude : BanDTO::DONT_BANDED_USERS)
                ->latest()
                ->get()
        ]);
    }

    /**
     * Метод для блокировки пользователя
     * @param BanDTO $request
     * @return JsonResponse
     */
    public function banUser(BanDTO $request): JsonResponse
    {
        $request->user->ban(
            $request->expired ? now()->parse($request->expired) : null,
            auth()->id(),
            $request->comment ?? null
        );
        $request->user->save();
        $response = ['success' => 'Пользователь забанен.'];
        return response()->json($response);
    }

    /**
     * Метод для разблокировки пользователя
     * @param UnbanDTO $request
     * @return JsonResponse
     */
    public function unbanUser(UnbanDTO $request): JsonResponse
    {
        $request->user->unban();
        return response()->json(['success' => 'Пользователь разбанен.']);
    }
}
