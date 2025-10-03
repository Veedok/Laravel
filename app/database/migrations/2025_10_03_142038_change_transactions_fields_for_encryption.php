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
            // Меняем поле name с varchar(255) на text
            Schema::table('transactions', function (Blueprint $table) {
                $table->text('name')->change();
            });

            // Меняем поле sum с double precision на text
            Schema::table('transactions', function (Blueprint $table) {
                $table->text('sum')->change();
            });
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::transaction(function () {
            // Восстанавливаем поле sum как double precision
            // Сначала конвертируем данные обратно
            DB::table('transactions')
                ->whereRaw("sum ~ '^-?[0-9]+(\.[0-9]+)?$'") // если значение числовое
                ->update(['sum' => DB::raw('sum::float::text')]);

            Schema::table('transactions', function (Blueprint $table) {
                $table->double('sum')->change();
            });

            // Восстанавливаем поле name как varchar(255)
            Schema::table('transactions', function (Blueprint $table) {
                $table->string('name', 255)->change();
            });
        });
    }
};
