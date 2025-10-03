<?php

namespace App\Http\Controllers;

use App\DTO\CryptoDTO;
use App\DTO\NewTableDTO;
use App\DTO\Table\AddUserDTO;
use App\DTO\Table\GetAndRemoveDTO;
use App\DTO\Table\UpdateDTO;
use App\DTO\TableDataDTO;
use App\Models\Transaction;
use App\Models\UserTable;
use App\Services\TableService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Response;
use JsonException;

/** Контроллер для работы с таблицами */
readonly class TablesController
{
    /**
     * Определение зависимостей
     * @param TableService $tableService
     */
    public function __construct(
        private TableService $tableService
    )
    {

    }

    /**
     * Главная страница
     * @param Request $request
     * @return Response
     */
    public function mainPage(Request $request): Response
    {
        return $this->tableService->getMainPage($request->session()->get('ActiveTable'));
    }

    /**
     * Получение данных таблицы
     * @param TableDataDTO $request
     * @return JsonResponse
     * @throws JsonException
     */
    public function getTableData(TableDataDTO $request): JsonResponse
    {
        return $this->tableService->getTableData($request);
    }

    /**
     * Создание новой таблицы
     * @param NewTableDTO $request
     * @return JsonResponse
     * @throws JsonException
     */
    public function newTable(NewTableDTO $request): JsonResponse
    {
        return response()->json($this->tableService->newTable($request));
    }

    /**
     * Рендер страницы управления таблицами
     * @return Response
     */
    public function getTablePage(): Response
    {
        return $this->tableService->getTableControl();
    }

    /**
     * Метод изменения таблицы
     * @param UpdateDTO $request
     * @return JsonResponse
     */
    public function editTable(UpdateDTO $request): JsonResponse
    {
        return $this->tableService->edit($request);
    }

    /**
     * Метод удаления таблицы
     * @param GetAndRemoveDTO $request
     * @return JsonResponse
     */
    public function remove(GetAndRemoveDTO $request): JsonResponse
    {
        return $this->tableService->remove($request);
    }

    /**
     * Метод для suggest при поиске добавляемых пользователей
     * @param Request $request
     * @return mixed
     */
    public function userSearch(Request $request): mixed
    {
        return $this->tableService->searchUsers($request);
    }

    /**
     * Метод добавления пользователя в таблицу
     * @param AddUserDTO $request
     * @return JsonResponse
     * @throws JsonException
     */
    public function share(AddUserDTO $request): JsonResponse
    {
        return $this->tableService->share($request);
    }


    public function crypto(CryptoDTO $request)
    {
        $result = ['status' => 500, 'content' => '123123123'];
        try {
            DB::transaction(function () use ($request, &$result) {
                $usersTable = $request->table->userTables()->get()->keyBy('user_id');
                $transactions = $request->table->transactions()->get()->keyBy('id');
                foreach ($request->users as $id => $user) {
                    /** @var UserTable $usersTable */
                    $update = $usersTable[$id];
                    $update->key = $user['encryptedDataKey'];
                    $update->salt = $user['salt'];
                    $update->safeSave();
                }
                foreach ($request->transactions as $id => $transaction) {
                    /** @var Transaction $update */
                    $update = $transactions[$id];
                    $update->sum = $transaction['sum'];
                    $update->name = $transaction['title'];
                    $update->save();
                }
                $result['status'] = 200;
                $result['content'] = "Ok";
            });
        } catch (Exception $e) {
            $result = ['content' => $e->getMessage()];
        }
        return response()->json($result['content'], $result['status']);
    }
}
