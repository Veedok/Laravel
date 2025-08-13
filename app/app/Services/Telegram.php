<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Log;

/** Класс для отправки в telegram */
class Telegram
{
    /** @var Client Газел клиент */
    protected Client $client;
    /** @var mixed Токен бота  */
    protected mixed $botToken;

    /**
     * Конструктор
     */
    public function __construct()
    {
        $this->client = new Client([
            'base_uri' => 'https://api.telegram.org/bot'.env('TELEGRAM_BOT_TOKEN').'/'
        ]);
        $this->botToken = env('TELEGRAM_BOT_TOKEN');
    }

    /**
     * Метод отправки файла
     * @param $chatId
     * @param $filePath
     * @param string $caption
     * @return false|mixed
     * @throws GuzzleException
     */
    public function sendFile($chatId, $filePath, string $caption = ''): mixed
    {
        try {
            $response = $this->client->post('sendDocument', [
                'multipart' => [
                    [
                        'name' => 'chat_id',
                        'contents' => $chatId
                    ],
                    [
                        'name' => 'document',
                        'contents' => fopen($filePath, 'rb'),
                        'filename' => basename($filePath)
                    ],
                    [
                        'name' => 'caption',
                        'contents' => $caption
                    ]
                ]
            ]);

            return json_decode($response->getBody(), true, 512, JSON_THROW_ON_ERROR);
        } catch (\Exception $e) {
            Log::error('Telegram error: '.$e->getMessage());
            return false;
        }
    }
}
