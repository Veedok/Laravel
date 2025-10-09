<?php

namespace App\Http\Controllers;

use App\DTO\ChangeTablePassDTO;
use App\DTO\CryptoDTO;
use App\DTO\DecryptDTO;
use App\Services\Crypto;
use Illuminate\Http\JsonResponse;

/** Контроллер для преобразования данных таблиц */
class CryptoController extends Controller
{
    /**
     * Определение зависимостей
     * @param Crypto $service
     */
    public function __construct(
        private readonly Crypto $service
    )
    {

    }

    /**
     * Метод шифрования таблицы
     * @param CryptoDTO $request
     * @return JsonResponse
     */
    public function crypto(CryptoDTO $request): JsonResponse
    {
        $result = $this->service->crypto($request);
        return response()->json($result['content'], $result['status']);
    }

    /**
     * Метод расшифровки данных
     * @param DecryptDTO $request
     * @return JsonResponse
     */
    public function decrypt(DecryptDTO $request): JsonResponse
    {
        $result = $this->service->decrypt($request);
        return response()->json($result['content'], $result['status']);
    }

    public function changePass(ChangeTablePassDTO $request): JsonResponse
    {
        $this->service->changePass($request);
        return response()->json(null, 204);
    }
}
