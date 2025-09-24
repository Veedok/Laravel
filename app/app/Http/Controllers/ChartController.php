<?php

namespace App\Http\Controllers;

use App\DTO\ChartDTO;
use App\Services\Charts;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

/** Контроллер для получения графиков */
class ChartController extends Controller
{

    /**
     * Определение зависимостей
     * @param Charts $charts
     */
    public function __construct(private readonly Charts $charts)
    {

    }

    /**
     * Получение страницы графиков
     * @return Response
     */
    public function index(): Response
    {
        return Inertia::render('Charts/Index', $this->charts->index());
    }

    /**
     * Получение данных для построения графиков
     * @param ChartDTO $request
     * @return JsonResponse
     */
    public function getTagStatistics(ChartDTO $request): JsonResponse
    {
        return response()->json($this->charts->getStatistic($request));
    }
}
