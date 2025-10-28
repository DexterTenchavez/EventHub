<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Carbon\Carbon;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'username',
        'contactNo',
        'sex',
        'dob',
        'barangay',
        'purok',
        'password',
        'role',
        'penalties',
        'banned_until',
        'ban_reason',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'banned_until' => 'datetime',
            'dob' => 'date',
        ];
    }

    // Add this method to check if user is admin
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    // Check if user is currently banned
    public function isBanned()
    {
        return $this->banned_until && Carbon::now()->lt($this->banned_until);
    }

    // Get remaining ban days
    public function getRemainingBanDays()
    {
        if (!$this->banned_until || !$this->isBanned()) {
            return 0;
        }
        
        return Carbon::now()->diffInDays($this->banned_until) + 1; // +1 to include current day
    }

    // Get ban status
    public function getBanStatus()
    {
        if (!$this->banned_until) {
            return 'not_banned';
        }
        
        if ($this->isBanned()) {
            return 'banned';
        }
        
        return 'ban_expired';
    }

    public function toArray()
    {
        $array = parent::toArray();
        // Ensure timestamps are always included
        $array['created_at'] = $this->created_at;
        $array['updated_at'] = $this->updated_at;
        $array['is_banned'] = $this->isBanned();
        $array['remaining_ban_days'] = $this->getRemainingBanDays();
        $array['ban_status'] = $this->getBanStatus();
        return $array;
    }

    public function registrations()
    {
        return $this->hasMany(\App\Models\Registration::class, 'email', 'email');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
}