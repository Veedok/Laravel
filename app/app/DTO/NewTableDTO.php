<?php

namespace App\DTO;

use App\Enums\Errors;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NewTableDTO extends AbstractDTO
{

    private Transaction $transaction;

    protected function __construct(
        public ?string $name = null,
    )
    {
    }

    public static function createFromRequest(Request $request): static
    {
        $data = $request->all();
        $validator = Validator::make($data, [
            'name' => 'required|string',
        ]);
        if ($validator->fails()) {
            return static::handleValidationErrors($validator);
        }
        $result = new static($data['name']);
        $user = auth()->user();
        $user !== null && $result->setRequestUser($user);
        return $result->validate();
    }

    protected function selfValidate(): void
    {
    }
}
