<?php

namespace App\Console\Commands;

use App\Services\Telegram;
use Illuminate\Console\Command;
use RuntimeException;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

/** Команда для создания бэкапа БД */
class BackupsCommand extends Command
{
    /**
     * Сигнатура команды
     * @var string
     */
    protected $signature = 'db:backup-send';

    /**
     * Описание команды
     * @var string
     */
    protected $description = 'Команда создания Бэкапов';

    /**
     * Выполнение команды.
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
            $telegram = new Telegram();
            $result = $telegram->sendFile(
                env('TELEGRAM_CHAT_ID'),
                $backupPath,
                "Бэкап БД от ".now()->format('d.m.Y')
            );
        } catch (ProcessFailedException $exception) {
            $this->error('Backup failed: ' . $exception->getMessage());
        }
    }
}
