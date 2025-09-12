<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Permission::create(['name' => 'view_admin_panel']);
        Permission::create(['name' => 'ban_users']);
        Permission::create(['name' => 'unban_users']);
        $adminRole = Role::create(['name' => 'admin']);
        $adminRole->givePermissionTo([
            'view_admin_panel',
            'ban_users',
            'unban_users',
        ]);
        Role::create(['name' => 'user']);
        $user = User::where('email', 'veedok18@yandex.ru')->first();
        if ($user) {
            $user->assignRole('admin');
        }
    }
}
