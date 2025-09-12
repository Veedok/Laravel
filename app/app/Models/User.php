<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Closure;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticate;
use Illuminate\Notifications\Notifiable;
use JsonException;
use Spatie\Permission\Traits\HasRoles;

/** Модель пользователя
 * @property mixed $pivot
 * @property mixed|null $tables
 * @property mixed $id
 * @property mixed $theme
 * @property mixed $is_banned
 * @method static find(int|null $user)
 */
class User extends Authenticate
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * Изменяемые поля
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'theme',
        'banned_until'
    ];

    /**
     * Скрытые поля
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $attributes = [
        'theme' => 'light',
    ];

    public function unusedTags()
    {
        $c = $this->tags()->whereDoesntHave('transactions');
        $c->delete();
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Связь с таблицами
     * @return BelongsToMany
     */
    public function tables(): BelongsToMany
    {
        return $this->belongsToMany(Table::class, 'user_tables')
            ->using(UserTable::class)
            ->withPivot(['permissions', 'is_owner']);
    }

    /**
     * Проверка прав на таблицу
     * @param $id
     * @return bool
     */
    public function checkTableAccess($id): bool
    {
        return $this->tables()->where('tables.id', $id)->exists();
    }

    /**
     * Проверка прав
     * @param int $id ID таблицы
     * @param string $permission Требуемые права
     * @return bool|null
     * @throws JsonException
     */
    public function checkTablePermission(int $id, string $permission): ?bool
    {
        $relation = $this->tables()->find($id)?->pivot;
        /** @var UserTable $relation */
        return $relation->hasPermission($permission);
    }

    public function setEmailAttribute($value)
    {
        $this->attributes['email'] = strtolower($value);
    }

    /**
     * Теги, принадлежащие пользователю.
     */
    public function tags()
    {
        return $this->hasMany(Tag::class);
    }

    public function bans(): HasMany
    {
        return $this->hasMany(Ban::class);
    }

    /**
     * Аксессор для проверки забанен ли пользователь
     */
    protected function isBanned(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->banned_until && $this->banned_until->gt(now())
        );
    }

    /**
     * Забанить пользователя
     */
    public function ban($until = null, $bannedById = null, $comment = null): void
    {
        $this->update(['banned_until' => $until]);
        $this->bans()->create([
            'created_by' => $bannedById ?? auth()->id(),
            'comment' => $comment,
            'expired_at' => $until,
        ]);
    }

    /**
     * Разбанить пользователя
     */
    public function unban(): void
    {
        $this->update(['banned_until' => '1970-01-01 00:00:00']);
    }
}
