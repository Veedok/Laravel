<?php

namespace App\Services;

use App\DTO\NewTableDTO;
use App\DTO\Table\AddUserDTO;
use App\DTO\Table\GetAndRemoveDTO;
use App\DTO\Table\UpdateDTO;
use App\DTO\TableDataDTO;
use App\Enums\Permissions;
use App\Models\Table;
use App\Models\User;
use App\Models\UserTable;
use App\Traits\ThemeTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use JsonException;

/** Сервис для работы с таблицами */
class TableService
{

    use ThemeTrait;

    /**
     * Метод отображения главной страницы
     * @param int|null $tableId
     * @return Response
     */
    public function getMainPage(?int $tableId): Response
    {
        /** @var User $user */
        $user = auth()->user();
        $tables = $user?->tables->mapWithKeys(/**
         * @param $table Table
         * @return array[]
         */ static function (Table $table) use ($tableId, $user) {
            return [
                $table->id => [
                    'name' => $table->name,
                    'active' => $table->id === $tableId,
                    'owner' => $table->getOwner(true) === $user->id
                ]
            ];
        })->all();
        $activeResult = array_unique(array_column($tables, 'active'));
        if (count($activeResult) === 1 && empty(current($activeResult))) {
            $key = key($tables);
            $tables[$key]['active'] = true;
        }
        return Inertia::render("Dashboard", [
            'theme' => $this->getTheme(),
            'csrfToken' => csrf_token(),
            'tables' => $tables,
        ]);
    }

    /**
     * Получение данных определенной таблицы
     * @param TableDataDTO $request
     * @return JsonResponse
     * @throws JsonException
     */
    public function getTableData(TableDataDTO $request): JsonResponse
    {
        /** @var Table $table */
        $table = Table::find($request->id);
        /** @var UserTable $userTable */
        $userTable = $table->userTables()->where('user_id', $request->requestUser->id)->first();
        $result = [
            'permission' => $table->getUserPermissions($request->requestUser->id),
            'userTags' => $request->requestUser->tags()->pluck('name')->toArray(),
            'transactions' => [],
            "is_encrypted"=> !empty($userTable->key) && !empty($userTable->salt),
            "tableKey" => $userTable->key,
            "salt" => $userTable->salt,
        ];
        foreach ($table->transactions as $item) {
            $result['transactions'][] = [
                'id' => $item->id,
                'title' => $item->name,
                'changeBalance' => $item->type === 'income',
                'sum' => $item->sum,
                'date' => $item->date->format('d.m.Y'),
                'tags' => array_column($item->tags->toArray(), 'name')
            ];
        }
        return response()->json($result);
    }

    /**
     * Создание новой таблицы
     * @param NewTableDTO $request
     * @return array
     * @throws JsonException
     */
    public function newTable(NewTableDTO $request): array
    {
        /** @var Table $table */
        $table = $request->requestUser->tables()->create([
            'name' => $request->name
        ], [
            'is_owner' => true,
            'permissions' => json_encode([], JSON_THROW_ON_ERROR)
        ]);
        return ['id' => $table->id];
    }

    /**
     * Получение страницы управления таблицами
     * @return Response
     */
    public function getTableControl(): Response
    {
        /** @var User $user */
        $user = auth()->user();
        $tables = $user?->tables->mapWithKeys(static function ($table) use ($user) {
            $owner = $table->users()->where('is_owner', true)->first();
            $test = $table->userTables()->where('is_owner', true)->first();
            return [$table->id => [
                'owner' => sprintf('Владелец: %s, %s', $owner->email, $owner->name),
                'name' => $table->name,
                'permissions' => $table->getUserPermissions($user->id),
                'crypt' => !empty($test->key) && !empty($test->salt),
                "tableKey" => $test->key,
                "salt" => $test->salt,

            ]];
        })->all();
        return Inertia::render("TableControl", [
            'theme' => $this->getTheme(),
            'csrfToken' => csrf_token(),
            'tables' => $tables,
            'permissions' => Permissions::getDescriptions(),
        ]);
    }

    /**
     * Изменение таблицы
     * @param UpdateDTO $request
     * @return JsonResponse
     */
    public function edit(UpdateDTO $request): JsonResponse
    {
        $table = Table::find($request->id);
        $table->name = $request->name;
        $table->save();
        return response()->json(null, 204);
    }

    /**
     * Удаление таблицы
     * @param GetAndRemoveDTO $request
     * @return JsonResponse
     */
    public function remove(GetAndRemoveDTO $request): JsonResponse
    {
        $table = Table::find($request->id);
        $table->delete();
        return response()->json(null, 204);
    }

    /**
     * Метод поиска пользователей для добавления
     * @param Request $request
     * @return mixed
     */
    public function searchUsers(Request $request): mixed
    {
        $query = $request->input('query');
        $tableId = $request->input('tableId');
        return User::where(static function ($q) use ($query) {
            $q->where('email', 'like', "$query%")
                ->orWhere('name', 'like', "$query%");
        })
            ->whereDoesntHave('tables', function ($q) use ($tableId) {
                $q->where('table_id', $tableId);
            })
            ->limit(5)
            ->get(['id', 'name', 'email']);
    }

    /**
     * Метод предоставления прав пользователю
     * @param AddUserDTO $request
     * @return JsonResponse
     * @throws JsonException
     */
    public function share(AddUserDTO $request): JsonResponse
    {
        $user = User::find($request->user);
        $data = [
            'permissions' => json_encode($request->permissions, JSON_THROW_ON_ERROR),
            'is_owner' => false,
        ];
        !empty($request->key) && $data['key'] = $request->key;
        !empty($request->salt) && $data['salt'] = $request->salt;
        $user->tables()->attach($request->table->id, $data);
        return response()->json(null, 204);
    }

    public function aboutUs()
    {
        return Inertia::render("AboutUs", [
            'theme' => $this->getTheme()
        ]);
    }
}
