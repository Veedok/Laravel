<?php

namespace App\Console\Commands;

use App\Mail\DatabaseBackupMail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use RuntimeException;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

class BackupsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:backup-send {email}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Команда создания Бэкапов';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $backupFileName = 'backup_' . date('Y-m-d') . '.sql';
        $backupPath = storage_path('app/backups/' . $backupFileName);
        if (!file_exists(dirname($backupPath)) && !mkdir($concurrentDirectory = dirname($backupPath), 0755, true) && !is_dir($concurrentDirectory)) {
            throw new RuntimeException(sprintf('Directory "%s" was not created', $concurrentDirectory));
        }
        $command = sprintf("PGPASSWORD='%s' pg_dump -h %s -p %s -U %s -F c -b -v -f %s %s", env('DB_PASSWORD'), env('DB_HOST'), env('DB_PORT', 5432), env('DB_USERNAME'), $backupPath, env('DB_DATABASE'));
        $process = Process::fromShellCommandline($command);
        $process->setTimeout(300);
        try {
            $process->mustRun();
            $this->info('Database backup created successfully: ' . $backupFileName);
            $email = $this->argument('email');
            Mail::to($email)->send(new DatabaseBackupMail($backupPath));
            $this->info('Backup sent to email: ' . $email);
        } catch (ProcessFailedException $exception) {
            $this->error('Backup failed: ' . $exception->getMessage());
        }
    }
}
