<?php

namespace App\DTO\Table;

use App\DTO\AbstractDTO;
use App\Enums\Errors;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use JsonException;

/** DTO для обновления транзакции */
class UpdateDTO extends AbstractDTO
{

    /** @var Transaction Обновляемая запись */
    public Transaction $transaction;

    /**
     * Закрытый конструктор
     * @param int|null $id
     * @param string|null $name
     */
    protected function __construct(
        public ?int    $id = null,
        public ?string $name = null,
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
            'id' => 'required|integer',
            'name' => 'required|string|max:255'
        ]);
        if ($validator->fails()) {
            return static::handleValidationErrors($validator);
        }
        $result = new static($data['id'], $data['name']);
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
        if (!$this->requestUser->checkTablePermission($this->id, 'editTables')){
            $this->makeError(Errors::ACCESS_DENIED, 400);
        }
    }
}
