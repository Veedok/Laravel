<?php

namespace App\Services;

use App\DTO\ChangeTablePassDTO;
use App\DTO\CryptoDTO;
use App\DTO\DecryptDTO;
use App\Models\Transaction;
use App\Models\UserTable;
use Exception;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/** Сервис для шифрования-расшифровки данных в таблицах (шифрует фронт тут в основном работа с изменением таблиц в БД) */
class Crypto
{

    /**
     * Метод для шифрования таблицы
     * @param CryptoDTO $request
     * @return array
     */
    public function crypto(CryptoDTO $request): array
    {
        $result = ['status' => 500, 'content' => ''];
        try {
            DB::transaction(function () use ($request, &$result) {
                $usersTable = $request->table->userTables()->get()->keyBy('user_id');
                $transactions = $request->table->transactions()->get()->keyBy('id');
                foreach ($request->users as $id => $user) {
                    /** @var UserTable $usersTable */
                    $update = $usersTable[$id];
                    $update->key = $user['encryptedDataKey'];
                    $update->salt = $user['salt'];
                    $update->safeSave();
                }
                $this->saveTransactions($request->transactions, $transactions);
                $result['status'] = 200;
                $result['content'] = "Ok";
            });
        } catch (Exception $e) {
            $result = ['content' => $e->getMessage()];
        }
        return $result;
    }

    /**
     * Метод расшифровки таблиц
     * @param DecryptDTO $request
     * @return array
     */
    public function decrypt(DecryptDTO $request): array
    {
        $result = ['status' => 500, 'content' => '123123123'];
        try {
            DB::transaction(function () use ($request, &$result) {
                /** @var UserTable $user */
                foreach ($request->table->userTables()->get() as $user) {
                    $user->salt = null;
                    $user->key = null;
                    $user->safeSave();
                }
                $transactions = $request->table->transactions()->get()->keyBy('id');
                $this->saveTransactions($request->transactions, $transactions);
                $result['status'] = 200;
                $result['content'] = "Ok";
            });
        } catch (Exception $e) {
            $result = ['content' => $e->getMessage()];
        }
        return $result;
    }

    /**
     * Метод сохранения транзакций
     * @param array|null $transactions
     * @param Collection $dbTransactions
     * @return void
     */
    private function saveTransactions(?array $transactions, Collection $dbTransactions): void
    {
        foreach ($transactions as $id => $transaction) {
            /** @var Transaction $update */
            $update = $dbTransactions[$id];
            $update->sum = $transaction['sum'];
            $update->name = $transaction['title'];
            $update->save();
        }
    }

    public function changePass(ChangeTablePassDTO $request)
    {
        $request->relation->key = $request->key;
        $request->relation->salt = $request->salt;
        $request->relation->safeSave();
    }


}
