<?php

namespace App\DTO\Table;

use App\DTO\AbstractDTO;
use App\Enums\Errors;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/** DTO для удаления записи из таблицы */
class GetAndRemoveDTO extends AbstractDTO
{


    private const MAP = [
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
     */
    protected function selfValidate(): void
    {
        if (!$this->requestUser->checkTablePermission($this->id, $this->rights)) {
            $this->makeError(Errors::ACCESS_DENIED, 403);
        }
    }

    private function setPermissionCheck(?string $route)
    {
        $this->rights = !empty($route) && array_key_exists($route, self::MAP)
            ? self::MAP[$route]
            : current(self::MAP);
    }
}
