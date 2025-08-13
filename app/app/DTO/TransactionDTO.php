<?php

namespace App\DTO;

use App\Enums\Errors;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/** DTO для создания записи в таблице */
class TransactionDTO extends AbstractDTO
{
    /**
     * Закрытый конструктор
     * @param int|null $table
     * @param string|null $name
     * @param bool $changeBalance
     * @param float|null $sum
     * @param Carbon|null $date
     */
    protected function __construct(
        public ?int    $table = null,
        public ?string $name = null,
        public bool    $changeBalance = false,
        public ?float  $sum = null,
        public ?Carbon $date = null
    )
    {
        if ($this->sum !== null) {
            $this->sum = round($this->sum, 2);
        }
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
            'tableId' => 'required|integer|exists:tables,id',
            'name' => 'required|string|max:255',
            'type' => 'required|bool',
            'sum' => 'required|numeric',
            'date' => 'required|date'
        ]);
        if ($validator->fails()) {
            return static::handleValidationErrors($validator);
        }
        $result = new static($data['tableId'], $data['name'], $data['type'], $data['sum'], new Carbon($data['date']));
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
        if (!$this->requestUser->checkPermission($this->table)) {
            $this->makeError(Errors::ACCESS_DENIED, 403);
        }
    }
}
