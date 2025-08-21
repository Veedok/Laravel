<?php

namespace App\Http\Controllers;

use App\DTO\Table\ChangePermissionDTO;
use App\DTO\Table\DelUserDTO;
use App\DTO\Table\GetAndRemoveDTO;
use App\Services\Permissions;
use Illuminate\Http\JsonResponse;
use JsonException;

/** Контроллер для работы с правами пользователей */
readonly class PermissionsController
{
    /**
     * Определение зависимостей
     * @param Permissions $service
     */
    public function __construct(private Permissions $service)
    {

    }

    /**
     * Получение пользователей таблиц
     * @param GetAndRemoveDTO $request
     * @return JsonResponse
     * @throws JsonException
     */
    public function getUsers(GetAndRemoveDTO $request): JsonResponse
    {
        return response()->json($this->service->get($request->id, $request->requestUser->id));
    }

    /**
     * Обновление прав пользователей
     * @param ChangePermissionDTO $request
     * @return JsonResponse
     * @throws JsonException
     */
    public function updatePermissions(ChangePermissionDTO $request): JsonResponse
    {
        return response()->json($this->service->changePermission($request));
    }

    /**
     * Удаление пользователя из таблицы
     * @param DelUserDTO $request
     * @return JsonResponse
     */
    public function removeUser(DelUserDTO $request): JsonResponse
    {
        return response()->json($this->service->delUser($request));
    }
}
