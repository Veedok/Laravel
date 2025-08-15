<?php

namespace App\Http\Controllers;

use App\DTO\Table\ChangePermissionDTO;
use App\DTO\Table\DelUserDTO;
use App\DTO\Table\GetAndRemoveDTO;
use App\Models\Table;
use App\Services\Permissions;
use Illuminate\Http\Request;

class PermissionsController
{
    public function __construct(private readonly Permissions $service)
    {

    }

    public function getUsers(GetAndRemoveDTO $request)
    {
        return response()->json($this->service->get($request->id, $request->requestUser->id));
    }

    public function updatePermissions(ChangePermissionDTO $request)
    {
        return response()->json($this->service->changePermission($request));
    }

    public function removeUser(DelUserDTO $request)
    {
        return response()->json($this->service->delUser($request));
    }
}
