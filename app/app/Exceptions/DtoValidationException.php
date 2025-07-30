<?php

namespace App\Exceptions;

use Exception;
use Symfony\Component\HttpFoundation\Response;

/** Ошибка вызываемая при неудачной валидации DTO */
class DtoValidationException extends Exception
{
    /**
     * Конструктор
     * @param Response $response Экземпляр ответа JSON
     */
    public function __construct(public Response $response)
    {
        parent::__construct('DTO validation failed');
    }

    /**
     * Отдаем заранее сгенерированный ответ
     * @return Response
     */
    public function render(): Response
    {
        return $this->response;
    }
}
