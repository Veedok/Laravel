<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

/** Трейт валидации */
trait Checker
{


    /** @var array Ошибки проверки данных */
    protected array $error = [];


    /**
     * Метод добавления ошибки
     * @param string|array $msg
     * @param int $code
     * @return void
     */
    public function makeError(string|array $msg, int $code): void
    {
        is_string($msg) ? $this->error['messages'][] = $msg : $this->error['messages'] = array_merge(($this->error['messages'] ?? []), $msg);
        $this->error['code'] = $code;
    }

    /**
     * Создание ответа с ошибками
     */
    public function makeResponse()
    {
        $error = $this->error;
        $this->error = [];
        $result = [
            "title" => Response::$statusTexts[$error['code']] ?? 'Unknown Status',
            "status" => $error['code'],
            "errors" => $error['messages']
        ];
//        return response()->json($result, $error['code']);
        return back()->withErrors([
            'title' => 'Название обязательно',
            'sum' => 'Некорректная сумма'
        ]);
    }


    /**
     * Проверка наличия ошибок
     * @return bool
     */
    public function hasError(): bool
    {
        return !empty($this->error);
    }


    /**
     * Метод возвращает массив с ошибками
     * @return array
     */
    public function getErrorsMessages(): array
    {
        return $this->error['messages'] ?? [];
    }
}
