<?php

namespace App\Http\Controllers\Admin;

use App\DTO\Admin\BanDTO;
use App\DTO\Admin\UnbanDTO;
use App\Http\Controllers\Controller;
use App\Services\Admin\Ban;
use Illuminate\Http\JsonResponse;
use Inertia\Response;

class UserController extends Controller
{

    public function __construct(private readonly Ban $ban)
    {

    }

    /**
     * Display a listing of the users.
     */
    public function index(): Response
    {
        return $this->ban->adminPage();

    }

    /**
     * Ban the specified user.
     */
    public function ban(BanDTO $request): JsonResponse
    {
        return $this->ban->banUser($request);
    }

    /**
     * Unban the specified user.
     */
    public function unban(UnbanDTO $request): JsonResponse
    {
        return $this->ban->unbanUser($request);
    }
}
