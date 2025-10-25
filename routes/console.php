<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Facades\Log;  // ← Add this import

// Add this schedule command
Schedule::call(function () {
    try {
        Log::info('🔄 Running automatic event notification check');
        
        $controller = app()->make(\App\Http\Controllers\EventController::class);
        $result = $controller->checkEventNotifications();
        
        Log::info('✅ Scheduled notification check completed', [
            'notifications_sent' => $result->getData()->notifications_sent ?? 0,
            'events_checked' => $result->getData()->events_checked ?? 0
        ]);
    } catch (\Exception $e) {
        Log::error('❌ Error in scheduled notification check: ' . $e->getMessage());
    }
})->everyMinute()->name('event-notifications');

// You can keep or remove the inspiring quote below
Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');