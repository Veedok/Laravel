<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_tables', function (Blueprint $table) {
            $table->id('user_id');
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->id('table_id');
            $table->foreign('table_id')->references('id')->on('tables')->cascadeOnDelete();
            $table->foreignId('role_id')->constrained('roles')->default(2);
            $table->primary(['user_id', 'table_id']);
        });
        DB::statement('
        CREATE UNIQUE INDEX one_owner_per_table
        ON user_tables (table_id)
        WHERE (role_id = 1)
    ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_tables');
    }
};
