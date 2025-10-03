<?php

namespace App\Traits;

use App\Models\Table;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

/** Трейт валидации */
trait Checker
{
    const array MODEL_MAP = [
        'user' => [
            'class' => User::class,
            'error' => "Пользователь не найден"
        ],
        'table' => [
            'class' => Table::class,
            'error' => 'Таблица не найдена'
        ]
    ];

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
     * @return JsonResponse
     */
    public function makeResponse(): JsonResponse
    {
        $error = $this->error;
        $this->error = [];
        $result = [
            "title" => Response::$statusTexts[$error['code']] ?? 'Unknown Status',
            "status" => $error['code'],
            "errors" => $error['messages']
        ];
        return response()->json($result, $error['code']);
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

    protected function findModel($id, $model): mixed
    {
        $obj = null;
        if (array_key_exists($model, self::MODEL_MAP)) {
            $obj = self::MODEL_MAP[$model]['class']::find($id);
            if (empty($obj)) {
                $this->makeError(self::MODEL_MAP[$model]['error'], 404);
            }
        } else {
            $this->makeError('Wrong Model', 500);
        }
        return $obj;
    }
}
