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
            Schema::table('user_tables', function (Blueprint $table) {
                $table->text('key')->nullable()->comment('Base64 encoded string');
                $table->string('salt', 64)->nullable()->comment('Hex encoded string');
            });
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::transaction(function () {
            Schema::table('user_tables', function (Blueprint $table) {
                $table->dropColumn(['key', 'salt']);
            });
        });
    }
};
