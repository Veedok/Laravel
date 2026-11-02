<?php

namespace App\Console\Commands;

use App\Services\Telegram;
use Exception;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Console\Command;
use RuntimeException;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;
use Illuminate\Support\Facades\Storage;

/** Команда для создания бекап БД */
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
    protected $description = 'Команда создания бекап';

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
            try {
                $telegram = new Telegram();
                logger()?->channel('backup')->info($telegram->sendFile(
                    env('TELEGRAM_CHAT_ID'),
                    $backupPath,
                    "Бэкап БД от ".now()->format('d.m.Y')
                ));
                unlink($backupPath);
            } catch (Exception | GuzzleException $telegramException) {
                logger()?->channel('backup')->warning('Telegram failed: ' . $telegramException->getMessage() . '. Переключаемся на S3.');
                $this->sendToS3($backupPath, $backupFileName);
            }
        } catch (ProcessFailedException $exception) {
            $this->error('Backup (pg_dump) failed: ' . $exception->getMessage());
            logger()?->channel('backup')->error('pg_dump failed: ' . $exception->getMessage());
        }
    }

    /**
     * Вспомогательный метод для отправки в S3
     */
    private function sendToS3(string $localPath, string $fileName): void
    {
        try {
            if (!file_exists($localPath)) {
                throw new Exception("Файл бэкапа не найден: {$localPath}");
            }
            $fileStream = fopen($localPath, 'r');
            Storage::disk('bunny')->put('backups/' . $fileName, $fileStream);

            if (is_resource($fileStream)) {
                fclose($fileStream);
            }
            logger()?->channel('backup')->info("Бэкап успешно загружен в S3 (Bunny): backups/{$fileName}");
            unlink($localPath);
        } catch (Exception $e) {
            $this->error('S3 Backup failed: ' . $e->getMessage());
            logger()?->channel('backup')->error('S3 Upload failed: ' . $e->getMessage());
        }
    }
}
