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
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->json('permission')
                ->nullable()
                ->comment('Права пользователя');
        });
        DB::table('roles')->insert([
            ['id' => 1, 'name' => 'owner', 'permission' => json_encode([], JSON_THROW_ON_ERROR)],
            ['id' => 2, 'name' => 'guest', 'permission' => json_encode(['change', 'add', 'del'], JSON_THROW_ON_ERROR)],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
