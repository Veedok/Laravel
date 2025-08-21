<?php

namespace App\Services;

use App\DTO\Table\ChangePermissionDTO;
use App\DTO\Table\DelUserDTO;
use App\Models\Table;
use JsonException;

/** Сервис для работы с правами */
class Permissions
{

    /**
     * Получение пользователей таблицы кроме владельца и запрашивающего пользователя
     * @param int $id
     * @param int $requestUserId
     * @return mixed
     * @throws JsonException
     */
    public function get(int $id, int $requestUserId): mixed
    {
        $table = Table::find($id);
        return $table->users()->where('user_id', '!=', $requestUserId)->withPivot('permissions')->wherePivot('is_owner', false)->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'permissions' => is_string($user->pivot->permissions) ? (json_decode($user->pivot->permissions, true, 512, JSON_THROW_ON_ERROR) ?? []) : $user->pivot->permissions,
            ];
        });
    }

    /**
     * Изменение прав пользователя
     * @param ChangePermissionDTO $request
     * @return true[]
     * @throws JsonException
     */
    public function changePermission(ChangePermissionDTO $request): array
    {
        $table = Table::find($request->table);
        $user = $table->users()->where('user_id', $request->user)->first();
        $permissions = json_decode($user->pivot->permissions, true, 512, JSON_THROW_ON_ERROR) ?? [];
        if ($request->flag) {
            if (!in_array($request->permission, $permissions, true)) {
                $permissions[] = $request->permission;
            }
        } else {
            $permissions = array_values(array_diff($permissions, [$request->permission]));

        }
        $table->users()->updateExistingPivot($request->user, [
            'permissions' => json_encode($permissions, JSON_THROW_ON_ERROR)
        ]);
        return ['success' => true];
    }

    /**
     * Удаление пользователя из таблицы
     * @param DelUserDTO $request
     * @return true[]
     */
    public function delUser(DelUserDTO $request): array
    {
        $table = Table::find($request->table);
        $table->users()->detach($request->user);
        return ['success' => true];
    }
}
