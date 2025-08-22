<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\VarDumper\Cloner\VarCloner;
use Symfony\Component\VarDumper\Dumper\CliDumper;

class ViewUsersCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:get-all {email?}';

    protected int $maxAttempts = 3;
    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Просмотр зарегистрированных пользователей и их таблиц';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if (!$this->authenticate()) {
            $this->error('Authentication failed. Command aborted.');
            return 1;
        }

        $this->displayUsersData($this->getUserData($this->argument('email')));

        return 0;
    }

    protected function authenticate(): bool
    {
        $storedHash = config('app.console_admin_password');
        if (empty($storedHash)) {
            $this->error('Admin password not configured. Please set CONSOLE_ADMIN_PASSWORD in .env');
            return false;
        }
        $attempts = 0;
        while ($attempts < $this->maxAttempts) {
            $password = $this->secret('Enter admin password:');

            if (Hash::check($password, $storedHash)) {
                $this->info('✓ Authentication successful!');
                return true;
            }
            $attempts++;
            $remaining = $this->maxAttempts - $attempts;

            if ($remaining > 0) {
                $this->error("✗ Invalid password. {$remaining} attempts remaining.");
            }
        }
        return false;
    }

    private function getUserData($email = null)
    {
        $result = [];
        $users = isset($email) ? User::where('email', $email)->get() : User::all();
        foreach ($users as $user) {
            $result[$user->email] = [];
            foreach ($user->tables as $table) {
                if ($table->getOwner(true) === $user->id) {
                    $result[$user->email]['owner'][] = $table->name;
                } else {
                    $result[$user->email]['guest'][] = [
                        'tableName' => $table->name,
                        'permission' => $table->getUserPermissions($user->id, true)
                    ];
                }
            }
        }
        return $result;
    }

    protected function displayUsersData(array $usersData): void
    {
        $this->info("\n" . str_repeat('=', 100));
        $this->info('USER TABLES AND PERMISSIONS');
        $this->info(str_repeat('=', 100));
        foreach ($usersData as $email => $data) {
            $this->info("\n📧 <fg=cyan>Email: " . $email . "</>");
            $this->info(str_repeat('-', 100));
            if (empty($data)) {
                $this->line("   No tables or permissions");
                continue;
            }
            if (isset($data['owner']) && !empty($data['owner'])) {
                $this->line("   🏆 <fg=green>OWNER TABLES:</>");
                foreach ($data['owner'] as $table) {
                    $this->line("      • " . $table);
                }
            }
            if (isset($data['guest']) && !empty($data['guest'])) {
                $this->line("   👥 <fg=yellow>GUEST TABLES:</>");
                foreach ($data['guest'] as $guestData) {
                    $tableName = $guestData['tableName'] ?? 'Unknown Table';
                    $permission = $guestData['permission'] ?? [];
                    $this->line("      • Table: " . $tableName);
                     if (!empty($permission)) {
                        $this->line("        Permissions: " . implode(', ', $permission));
                    } else {
                        $this->line("        Permissions: None");
                    }
                }
            }
            $otherKeys = array_diff(array_keys($data), ['owner', 'guest']);
            if (!empty($otherKeys)) {
                $this->line("   ⚠️  <fg=red>UNEXPECTED KEYS:</> " . implode(', ', $otherKeys));
            }
        }
        $this->info("\n" . str_repeat('=', 100));
        $this->info('END');
        $this->info(str_repeat('=', 100));
    }
}
