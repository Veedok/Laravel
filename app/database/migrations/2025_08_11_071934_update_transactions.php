<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::transaction(function () {
            DB::statement('ALTER TABLE transactions DROP CONSTRAINT transactions_user_id_fkey');
            DB::statement('ALTER TABLE transactions RENAME COLUMN user_id TO table_id');
            DB::statement('ALTER TABLE transactions ADD CONSTRAINT transactions_table_id_foreign
                      FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropForeign(['table_id']);
            $table->renameColumn('table_id', 'user_id');
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }
};
