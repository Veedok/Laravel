<?php

namespace App\Http\Controllers;

use App\DTO\DestroyDTO;
use App\DTO\TableDataDTO;
use App\DTO\TransactionDTO;
use App\DTO\UpdateTransactionDTO;
use App\Services\TableService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{

    public function __construct(
        private readonly TableService $tableService
    )
    {

    }
    public function dashboard()
    {
        return $this->tableService->getTable();
    }

    public function saveData(TransactionDTO $request)
    {
        return $this->tableService->save($request);
    }

    public function update(UpdateTransactionDTO $request)
    {
        return $this->tableService->update($request);
    }

    public function destroy(DestroyDTO $request)
    {
        return $this->tableService->destroy($request);
    }

    public function getTableData(TableDataDTO $request)
    {
        return $this->tableService->getTableData($request);
    }
}
