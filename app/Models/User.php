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
        'penalty_expires_at',
        'banned_until',
        'ban_reason',
        'reset_token',
        'reset_token_expires_at',
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
            'penalty_expires_at' => 'datetime',
            'banned_until' => 'datetime',
            'dob' => 'date',
            'reset_token_expires_at' => 'datetime',
        ];
    }

    public function isBanned()
    {
        return $this->banned_until && Carbon::now()->lt($this->banned_until);
    }

    public function checkAndResetPenalties()
    {
        if ($this->penalty_expires_at && \Carbon\Carbon::now()->gt($this->penalty_expires_at)) {
            $oldPenalties = $this->penalties;
            $this->penalties = 0;
            $this->penalty_expires_at = null;
            $this->banned_until = null;
            $this->save();
            
            $this->createPenaltiesResetNotification($oldPenalties);
            return true;
        }
        return false;
    }

    public function addPenalty()
    {
        $this->checkAndResetPenalties();

        $this->penalties += 1;
        
        $this->penalty_expires_at = \Carbon\Carbon::now()->addDays(30);
        
        if ($this->penalties >= 3) {
            $this->banned_until = $this->penalty_expires_at;
            $this->createBanNotification();
        } else {
            $this->createPenaltyNotification();
        }
        
        $this->save();
        
        return $this;
    }

    public function removePenalty()
    {
        if ($this->penalties > 0) {
            $this->penalties -= 1;
            
            if ($this->penalties > 0) {
                $this->penalty_expires_at = \Carbon\Carbon::now()->addDays(30);
            } else {
                $this->penalty_expires_at = null;
            }
            
            if ($this->penalties < 3 && $this->isBanned()) {
                $this->banned_until = null;
                $this->createBanLiftedNotification();
            }
            
            $this->save();
            
            $this->createPenaltyRemovedNotification();
        }
        
        return $this;
    }

    public function canRegisterForEvents()
    {
        $this->checkAndResetPenalties();

        if ($this->isBanned() || $this->penalties >= 3) {
            return false;
        }

        return true;
    }

    private function createPenaltyNotification()
    {
        $message = $this->getPenaltyMessage();
        
        Notification::create([
            'user_id' => $this->id,
            'title' => 'Penalty Added ⚠️',
            'message' => $message,
            'type' => 'warning',
            'is_read' => false
        ]);
    }

    private function createBanNotification()
    {
        $banDays = $this->getRemainingBanDays();
        
        Notification::create([
            'user_id' => $this->id,
            'title' => 'Account Banned 🚫',
            'message' => "Your account has been banned from event registration for {$banDays} days due to multiple penalties. Ban ends on " . $this->banned_until->format('M d, Y'),
            'type' => 'error',
            'is_read' => false
        ]);
    }

    private function createBanLiftedNotification()
    {
        Notification::create([
            'user_id' => $this->id,
            'title' => 'Ban Lifted ✅',
            'message' => 'Your account ban has been lifted. You can now register for events again.',
            'type' => 'success',
            'is_read' => false
        ]);
    }

    private function createPenaltyRemovedNotification()
    {
        Notification::create([
            'user_id' => $this->id,
            'title' => 'Penalty Removed ✅',
            'message' => "One penalty has been removed. You now have {$this->penalties}/3 penalties.",
            'type' => 'success',
            'is_read' => false
        ]);
    }

    private function createPenaltiesResetNotification($oldPenalties)
    {
        Notification::create([
            'user_id' => $this->id,
            'title' => 'Penalties Reset 🔄',
            'message' => "Your {$oldPenalties} penalties have been automatically reset after 30 days.",
            'type' => 'info',
            'is_read' => false
        ]);
    }

    private function getPenaltyMessage()
    {
        $remainingDays = $this->getRemainingPenaltyDays();
        
        switch ($this->penalties) {
            case 1:
                return "You received 1 penalty for missing an event. Penalties will expire in {$remainingDays} days. Be careful with your event attendance.";
            
            case 2:
                return "You now have 2 penalties. One more penalty will result in a 30-day ban from event registration. Penalties expire in {$remainingDays} days.";
            
            case 3:
                $banDays = $this->getRemainingBanDays();
                return "You have reached 3 penalties! Your account is now banned from event registration for {$banDays} days. Ban ends on " . $this->banned_until->format('M d, Y');
            
            default:
                return "You received a penalty. You now have {$this->penalties}/3 penalties.";
        }
    }

    public function getRemainingPenaltyDays()
    {
        if (!$this->penalty_expires_at) {
            return 0;
        }
        
        $remaining = Carbon::now()->diffInDays($this->penalty_expires_at, false);
        return max(0, $remaining);
    }

    public function getRemainingBanDays()
    {
        if (!$this->banned_until || !$this->isBanned()) {
            return 0;
        }
        
        $remaining = Carbon::now()->diffInDays($this->banned_until, false);
        return max(0, $remaining);
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function toArray()
    {
        $array = parent::toArray();
        
        $array['is_banned'] = $this->isBanned();
        $array['remaining_ban_days'] = $this->getRemainingBanDays();
        $array['remaining_penalty_days'] = $this->getRemainingPenaltyDays();
        $array['can_register'] = $this->canRegisterForEvents();
        
        return $array;
    }

    public function registrations()
    {
        return $this->hasMany(Registration::class, 'email', 'email');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
}