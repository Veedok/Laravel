<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class Telegram
{
    protected $client;
    protected $botToken;

    public function __construct()
    {
        $this->client = new Client([
            'base_uri' => 'https://api.telegram.org/bot'.env('TELEGRAM_BOT_TOKEN').'/'
        ]);
        $this->botToken = env('TELEGRAM_BOT_TOKEN');
    }

    public function sendFile($chatId, $filePath, $caption = '')
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
                        'contents' => fopen($filePath, 'r'),
                        'filename' => basename($filePath)
                    ],
                    [
                        'name' => 'caption',
                        'contents' => $caption
                    ]
                ]
            ]);

            return json_decode($response->getBody(), true);
        } catch (\Exception $e) {
            Log::error('Telegram error: '.$e->getMessage());
            return false;
        }
    }
}
