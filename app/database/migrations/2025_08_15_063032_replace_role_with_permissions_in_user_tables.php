<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // 0. Удаляем старый уникальный индекс (если существует)
        DB::statement('DROP INDEX IF EXISTS one_owner_per_table');

        // 1. Пытаемся удалить внешний ключ только если он существует
        Schema::table('users', function (Blueprint $table) {
            if (DB::getDriverName() !== 'sqlite') { // SQLite не поддерживает эту проверку
                $foreignKeys = DB::select("
                    SELECT constraint_name
                    FROM information_schema.table_constraints
                    WHERE table_name = 'users'
                    AND constraint_type = 'FOREIGN KEY'
                    AND constraint_name = 'users_role_id_foreign'
                ");

                if (count($foreignKeys) > 0) {
                    $table->dropForeign(['role_id']);
                }
            } else {
                $table->dropForeign(['role_id']);
            }
        });

        // 2. Добавляем новые поля в user_tables
        Schema::table('user_tables', function (Blueprint $table) {
            $table->json('permissions')
                ->nullable()
                ->after('table_id')
                ->comment('JSON-массив прав пользователя для этой таблицы');

            $table->boolean('is_owner')
                ->default(false)
                ->after('permissions')
                ->comment('Флаг владельца таблицы');
        });

        // 3. Переносим существующие права
        DB::table('user_tables')->update([
            'permissions' => DB::raw("
                CASE
                    WHEN role_id = 1 THEN '[]'::jsonb
                    WHEN role_id = 2 THEN '[\"change\", \"add\", \"del\"]'::jsonb
                    ELSE '[]'::jsonb
                END
            "),
            'is_owner' => DB::raw('role_id = 1')
        ]);

        // 4. Удаляем старые колонки (только если они существуют)
        Schema::table('user_tables', function (Blueprint $table) {
            if (Schema::hasColumn('user_tables', 'role_id')) {
                $table->dropColumn('role_id');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'role_id')) {
                $table->dropColumn('role_id');
            }
        });

        // 5. Удаляем таблицу roles (если существует)
        Schema::dropIfExists('roles');

        // 6. Создаем новый уникальный индекс
        DB::statement('
            CREATE UNIQUE INDEX IF NOT EXISTS user_tables_one_owner_per_table
            ON user_tables (table_id)
            WHERE is_owner = true
        ');

    }

    public function down()
    {
        // Удаляем новые индексы (если существуют)
        DB::statement('DROP INDEX IF EXISTS user_tables_one_owner_per_table');
        DB::statement('DROP INDEX IF EXISTS user_tables_permissions_gin');

        // Восстанавливаем таблицу roles
        if (!Schema::hasTable('roles')) {
            Schema::create('roles', function (Blueprint $table) {
                $table->id();
                $table->string('name')->unique();
                $table->json('permission')->nullable();
            });

            DB::table('roles')->insert([
                ['id' => 1, 'name' => 'owner', 'permission' => json_encode([])],
                ['id' => 2, 'name' => 'guest', 'permission' => json_encode(['change', 'add', 'del'])],
            ]);
        }

        // Восстанавливаем колонку role_id в users
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'role_id')) {
                $table->foreignId('role_id')
                    ->after('id')
                    ->default(2)
                    ->constrained('roles');
            }
        });

        // Восстанавливаем колонку role_id в user_tables
        Schema::table('user_tables', function (Blueprint $table) {
            if (!Schema::hasColumn('user_tables', 'role_id')) {
                $table->foreignId('role_id')
                    ->after('table_id')
                    ->constrained('roles');
            }
        });

        // Переносим данные обратно (если есть is_owner)
        if (Schema::hasColumn('user_tables', 'is_owner')) {
            DB::table('user_tables')->update([
                'role_id' => DB::raw("CASE WHEN is_owner THEN 1 ELSE 2 END")
            ]);
        }

        // Удаляем добавленные колонки
        Schema::table('user_tables', function (Blueprint $table) {
            $table->dropColumnIfExists('permissions');
            $table->dropColumnIfExists('is_owner');
        });

        // Восстанавливаем старый индекс
        DB::statement('
            CREATE UNIQUE INDEX IF NOT EXISTS one_owner_per_table
            ON user_tables (table_id)
            WHERE (role_id = 1)
        ');
    }
};
