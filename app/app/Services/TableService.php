<?php

namespace App\Services;

use App\DTO\NewTableDTO;
use App\DTO\Table\AddUserDTO;
use App\DTO\Table\RemoveDTO;
use App\DTO\Table\UpdateDTO;
use App\DTO\TableDataDTO;
use App\Models\Table;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Сервис для работы с таблицами */
class TableService
{

    /**
     * Метод отображения главной страницы
     * @param int|null $tableId
     * @return Response
     */
    public function getMainPage(?int $tableId): Response
    {
        $callback = static function ($table) use ($tableId) {
            return [
                $table->id => [
                    'name' => $table->name,
                    'active' => $table->id === $tableId
                ]
            ];
        };
        return $this->makePage($callback, "Dashboard", true);
    }

    /**
     * Получение данных определенной таблицы
     * @param TableDataDTO $request
     * @return JsonResponse
     */
    public function getTableData(TableDataDTO $request): JsonResponse
    {
        $transactions = Table::find($request->id)->transactions;
        $result = [];
        foreach ($transactions as $item) {
            $result[] = [
                'id' => $item->id,
                'title' => $item->name,
                'changeBalance' => $item->type === 'income',
                'sum' => $item->sum,
                'date' => $item->date->format('d.m.Y')
            ];
        }
        return response()->json($result);
    }

    /**
     * Создание новой таблицы
     * @param NewTableDTO $request
     * @return array
     */
    public function newTable(NewTableDTO $request): array
    {
        /** @var Table $table */
        $table = $request->requestUser->tables()->create([
            'name' => $request->name
        ], [
            'role_id' => 1
        ]);
        return ['id' => $table->id];
    }

    public function getTableControl()
    {
        $callback = static function ($table) {
            return [$table->id => $table->name];
        };
        return $this->makePage($callback, "TableControl");
    }

    private function makePage($function, $page, $updateData = false)
    {
        $tables = auth()->user()?->tables->mapWithKeys($function)->all();
        if ($updateData) {
            $activeResult = array_unique(array_column($tables, 'active'));
            if (count($activeResult) === 1 && empty(current($activeResult))) {
                $key = key($tables);
                $tables[$key]['active'] = true;
            }
        }
        return Inertia::render($page, [
            'csrfToken' => csrf_token(),
            'tables' => $tables,
        ]);
    }

    public function edit(UpdateDTO $request)
    {
        $table = Table::find($request->id);
        $table->name = $request->name;
        $table->save();
        return response()->json(null, 204);
    }

    public function remove(RemoveDTO $request)
    {
        $table = Table::find($request->id);
        $table->delete();
        return response()->json(null, 204);
    }

    public function searchUsers(Request $request)
    {
        $query = $request->input('query');
        return User::where('email', 'like', "$query%")
            ->orWhere('name', 'like', "$query%")
            ->limit(5)
            ->get(['id', 'name', 'email']);
    }

    public function share(AddUserDTO $request)
    {
        $user = User::find($request->user);
        $user->tables()->attach($request->table, ['role_id' => 2]);
        return response()->json(null, 204);
    }
}
