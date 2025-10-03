<?php

namespace App\Providers;

use App\DTO\AbstractDTO;
use App\DTO\Admin\BanDTO;
use App\DTO\Admin\UnbanDTO;
use App\DTO\ChartDTO;
use App\DTO\CryptoDTO;
use App\DTO\DestroyDTO;
use App\DTO\NewTableDTO;
use App\DTO\Table\AddUserDTO;
use App\DTO\Table\ChangePermissionDTO;
use App\DTO\Table\DelUserDTO;
use App\DTO\Table\GetAndRemoveDTO;
use App\DTO\Table\UpdateDTO;
use App\DTO\TableDataDTO;
use App\DTO\TransactionDTO;
use App\DTO\UpdateTransactionDTO;
use App\Exceptions\DtoValidationException;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{

    const array DTO = [
        TransactionDTO::class,
        UpdateTransactionDTO::class,
        DestroyDTO::class,
        TableDataDTO::class,
        NewTableDTO::class,
        UpdateDTO::class,
        GetAndRemoveDTO::class,
        AddUserDTO::class,
        ChangePermissionDTO::class,
        DelUserDTO::class,
        ChartDTO::class,
        BanDTO::class,
        UnbanDTO::class,
        CryptoDTO::class
    ];
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        URL::forceScheme('https');
        Vite::prefetch(concurrency: 3);
        foreach (self::DTO as $dtoClass) {
            $this->app->bind($dtoClass, function () use ($dtoClass) {
                /** @var AbstractDTO $dtoClass */
                $dto = $dtoClass::createFromRequest(request());
                if ($dto->shouldValidate() && $dto->hasError()) {
                    throw new DtoValidationException($dto->makeResponse());
                }
                return $dto;
            });
        }
    }
}
