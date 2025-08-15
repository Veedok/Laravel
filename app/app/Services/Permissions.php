<?php

namespace App\Services;

use App\DTO\Table\ChangePermissionDTO;
use App\DTO\Table\DelUserDTO;
use App\Models\Table;

class Permissions
{

    public function get(int $id, $requestUserId)
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

    public function changePermission(ChangePermissionDTO $request)
    {
        $table = Table::find($request->table);
        $user = $table->users()->where('user_id', $request->user)->first();
        $permissions = json_decode($user->pivot->permissions, true, 512, JSON_THROW_ON_ERROR) ?? [];
        if ($request->flag) {
            if (!in_array($request->permission, $permissions, true)) {
                $permissions[] = $request->permission;
            }
        } else {
            $permissions1 = array_diff($permissions, [$request->permission]);
            $permissions = array_values(array_diff($permissions, [$request->permission]));

        }
        $table->users()->updateExistingPivot($request->user, [
            'permissions' => json_encode($permissions, JSON_THROW_ON_ERROR)
        ]);
        return ['success' => true];
    }

    public function delUser(DelUserDTO $request)
    {
        $table = Table::find($request->table);
        $table->users()->detach($request->user);
        return ['success' => true];
    }
}
