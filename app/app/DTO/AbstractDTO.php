<?php

namespace App\DTO;

use App\Enums\Errors;
use App\Models\User;
use App\Traits\Checker;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Validation\Validator;


/** Абстрактное DTO Для построения логики работы  */
abstract class AbstractDTO
{
    use Checker;

    public const array VALIDATE_MESSAGE = [];

    /** @var Validator|null Валидатор используется в web приложении */
    protected ?Validator $validator = null;

    /** @var User Модель пользователя сделавшего запрос */
    public User $requestUser;

    /**
     * Изменение модели пользователя сделавшего запрос
     * @param User $requestUser
     * @return void
     */
    protected function setRequestUser(User $requestUser): void
    {
        $this->requestUser = $requestUser;
    }

    /**
     * Метод создания DTO из запроса
     * @param Request $request Запрос
     * @return static
     */
    abstract public static function createFromRequest(Request $request): static;

    /**
     * Валидация данных
     * @return void
     */
    abstract protected function selfValidate(): void;

    /**
     * Точка входа
     * @return $this
     */
    protected function validate(): static
    {
        try {
            $this->selfValidate();
        } catch (Exception) {
            $this->makeError(Errors::SERVER_ERROR, 500);
        }
        return $this;
    }

    /** Метод установки валидатора нужен для web части приложения
     * @param Validator $validator
     * @return void
     */
    protected function setValidator(Validator $validator): void
    {
        $this->validator = $validator;
    }

    /**
     * Получение валидатора
     * @return Validator|null
     */
    public function getValidator(): ?Validator
    {
        return $this->validator;
    }

    /**
     * Переопределяемый метод в наследниках
     * Выводить ли ошибки валидации при обработке DTO или пропускать в контроллер даже с ошибками
     * @return bool
     */
    public function shouldValidate(): bool
    {
        return true;
    }

    /**
     * Преобразование ошибок валидации в коды
     * @param Validator $validator
     * @return array
     */
    protected function validationErrors(Validator $validator): array
    {
        $errorCodes = [Errors::VALIDATION_ERROR];
        $errors = $validator->errors();
        foreach ($validator->failed() as $field => $failedRules) {
            $firstError = $errors->first($field);
            foreach ($failedRules as $rule => $parameters) {
                $msg = in_array($rule, self::VALIDATE_MESSAGE, true) ? $firstError : $rule;
                $errorCodes[] = sprintf("%s_%s", $field, strtolower($msg));
            }
        }
        return $errorCodes;
    }

    /**
     * Метод возвращающий объект запрашиваемого DTO при ошибках валидации
     * @param Validator $validator
     * @param bool $web
     * @return static
     */
    protected static function handleValidationErrors(Validator $validator, bool $web = false): static
    {
        $result = new static();
        $result->makeError($result->validationErrors($validator), 400);
        $web && $result->setValidator($validator);
        return $result;
    }
}
