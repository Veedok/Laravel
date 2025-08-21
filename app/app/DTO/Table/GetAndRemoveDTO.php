<?php

namespace App\DTO\Table;

use App\DTO\AbstractDTO;
use App\Enums\Errors;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use JsonException;

/** DTO для работы с таблицей */
class GetAndRemoveDTO extends AbstractDTO
{


    private const array MAP = [
        'tableDelete' => 'removeTable',
        'tableUsers' => 'changeUsers'
    ];
    private string $rights;

    /**
     * Закрытый конструктор
     * @param int|null $id
     */
    protected function __construct(
        public ?int $id = null,
    )
    {
    }

    /**
     * Создание класса из запроса
     * @param Request $request
     * @return static
     */
    public static function createFromRequest(Request $request): static
    {
        $data = $request->all();
        $validator = Validator::make($data, [
            'id' => 'required|integer|exists:tables,id',
        ]);
        if ($validator->fails()) {
            return static::handleValidationErrors($validator);
        }
        $result = new static($data['id']);
        $result->setPermissionCheck($request->route()?->getName());
        /** @var User $user */
        $user = auth()->user();
        $user !== null && $result->setRequestUser($user);
        return $result->validate();
    }

    /**
     * Валидация
     * @return void
     * @throws JsonException
     */
    protected function selfValidate(): void
    {
        if (!$this->requestUser->checkTablePermission($this->id, $this->rights)) {
            $this->makeError(Errors::ACCESS_DENIED, 403);
        }
    }

    /**
     * Метод проставления флага для чего вызвано DTO
     * @param string|null $route
     * @return void
     */
    private function setPermissionCheck(?string $route): void
    {
        $this->rights = !empty($route) && array_key_exists($route, self::MAP)
            ? self::MAP[$route]
            : current(self::MAP);
    }
}
