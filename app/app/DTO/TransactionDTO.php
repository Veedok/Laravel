<?php

namespace App\DTO;

use App\Enums\Errors;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use JsonException;

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
     * @param string|array|null $tags
     */
    protected function __construct(
        public ?int              $table = null,
        public ?string           $name = null,
        public bool              $changeBalance = false,
        public float|string|null            $sum = null,
        public ?Carbon           $date = null,
        public null|string|array $tags = null
    )
    {
        if (is_float($this->sum)) {
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
            'sum' => 'required',
            'date' => 'required|date',
            'tags' => 'nullable|string'
        ]);
        if ($validator->fails()) {
            return static::handleValidationErrors($validator);
        }
        $result = new static($data['tableId'], $data['name'], $data['type'], $data['sum'], new Carbon($data['date']), ($data['tags'] ?? null));
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
        if (!$this->requestUser->checkTablePermission($this->table, 'addTransaction')) {
            $this->makeError(Errors::ACCESS_DENIED, 403);
        }
        if (!empty($this->tags)) {
            $this->tags = explode(' ', $this->tags);
        }
    }
}
