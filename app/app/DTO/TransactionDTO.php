<?php

namespace App\DTO;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TransactionDTO extends AbstractDTO
{

    private function __construct(
        public ?string $name = null,
        public bool $changeBalance = false,
        public ?float $sum = null,
        public ?Carbon $date = null
    )
    {
        if ($this->sum !== null) {
            $this->sum = round($this->sum, 2);
        }
    }
    public static function createFromRequest(Request $request): static
    {
        $data = $request->all();
        $validator = Validator::make($data, [
            'title' => 'required|string|max:255',
            'changeBalance' => 'required|bool',
            'sum' => 'required|numeric',
            'date' => 'required|date'
        ]);
        if ($validator->fails()) {
            return static::handleValidationErrors($validator);
        }
        $result = new static($data['title'], $data['changeBalance'], $data['sum'], new Carbon($data['date']));
        $user = auth()->user();
        $user !== null && $result->setRequestUser($user);
        return $result->validate();
    }

    protected function selfValidate(): void
    {
        // TODO: Implement selfValidate() method.
    }
}
