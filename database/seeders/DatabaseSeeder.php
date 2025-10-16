<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create only the admin account
        User::create([
            'name' => 'Admin User',
            'email' => 'dextertenchavez@gmail.com',
            'username' => 'admin',
            'role' => 'admin',
            'password' => Hash::make('Admin123!'),
        ]);
    }
}
