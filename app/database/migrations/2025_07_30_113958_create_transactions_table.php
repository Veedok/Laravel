<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up()
    {
        // Сначала создаем тип ENUM
        DB::statement("CREATE TYPE transaction_type AS ENUM ('income', 'expense')");

        // Затем создаем таблицу с использованием типа
        DB::statement("
            CREATE TABLE transactions (
                id BIGSERIAL PRIMARY KEY,
                user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                type transaction_type NOT NULL,
                sum FLOAT NOT NULL,
                date TIMESTAMP NOT NULL,
                created_at TIMESTAMP,
                updated_at TIMESTAMP
            )
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
        DB::statement('DROP TYPE IF EXISTS transaction_type');
    }
};
