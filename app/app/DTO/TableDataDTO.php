<?php

namespace App\DTO;

use App\Enums\Errors;
use App\Models\Table;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TableDataDTO extends AbstractDTO
{

    private Transaction $transaction;

    protected function __construct(
        public ?int $id = null,
    )
    {
    }
    public static function createFromRequest(Request $request): static
    {
        $data = $request->all();
        $validator = Validator::make($data, [
            'tableId' => 'required|integer|exists:tables,id',
        ]);
        if ($validator->fails()) {
            return static::handleValidationErrors($validator);
        }
        $result = new static($data['tableId']);
        $user = auth()->user();
        $user !== null && $result->setRequestUser($user);
        return $result->validate();
    }

    protected function selfValidate(): void
    {

        if (!$this->requestUser->checkPermisions($this->id)){
            $this->makeError(Errors::TABLE_NOT_FOUND, 400);
        }
    }
}
