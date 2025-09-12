<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index()
    {
        return Inertia::render('Admin/Users/Index', [
            'users' => User::with('roles')
                ->select('id', 'name', 'email', 'banned_until', 'created_at')
                ->latest()
                ->get()
        ]);
    }

    /**
     * Ban the specified user.
     */
    public function ban(Request $request)
    {
        $validated = $request->validate([
            'expired_at' => 'nullable|date',
            'comment' => 'nullable|string|max:500'
        ]);
        $user = User::find($request->get('user_id'));
        $user->ban(
            $validated['expired_at'] ? now()->parse($validated['expired_at']) : null,
            auth()->id(),
            $validated['comment'] ?? null
        );
        $user->save();
        return response()->json(['success' => 'Пользователь забанен.']);
    }

    /**
     * Unban the specified user.
     */
    public function unban(Request $request)
    {
        $user = User::find($request->get('user_id'));
        $user->unban();
        return response()->json(['success' => 'Пользователь разбанен.']);
    }
}
