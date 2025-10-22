<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Notification;
use App\Models\User;

class NotificationSeeder extends Seeder
{
    public function run()
    {
        $users = User::all();

        foreach ($users as $user) {
            Notification::create([
                'user_id' => $user->id,
                'title' => 'Welcome to EventHub!',
                'message' => 'Thank you for registering with EventHub. We hope you enjoy our platform.',
                'type' => 'info',
                'is_read' => false,
            ]);

            Notification::create([
                'user_id' => $user->id,
                'title' => 'New Feature Available',
                'message' => 'Check out our new event registration system!',
                'type' => 'success',
                'is_read' => true,
            ]);
        }
    }
}