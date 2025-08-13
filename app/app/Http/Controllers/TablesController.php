<?php

namespace App\Http\Controllers;

use App\DTO\NewTableDTO;
use App\DTO\TableDataDTO;
use App\Services\TableService;
use Illuminate\Http\JsonResponse;
use Inertia\Response;

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
     * @return Response
     */
    public function mainPage(): Response
    {
        return $this->tableService->getMainPage();
    }

    /**
     * Получение данных таблицы
     * @param TableDataDTO $request
     * @return JsonResponse
     */
    public function getTableData(TableDataDTO $request): JsonResponse
    {
        return $this->tableService->getTableData($request);
    }

    /**
     * Создание новой таблицы
     * @param NewTableDTO $request
     * @return JsonResponse
     */
    public function newTable(NewTableDTO $request): JsonResponse
    {
        return response()->json($this->tableService->newTable($request));
    }
}
