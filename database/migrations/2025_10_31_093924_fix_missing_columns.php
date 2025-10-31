<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Fix users table
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'ban_reason')) {
                $table->string('ban_reason')->nullable()->after('banned_until');
            }
        });

        // Fix registrations table  
        Schema::table('registrations', function (Blueprint $table) {
            if (!Schema::hasColumn('registrations', 'user_id')) {
                $table->foreignId('user_id')->nullable()->after('email');
            }
            if (!Schema::hasColumn('registrations', 'status')) {
                $table->string('status')->default('registered')->after('attendance');
            }
            if (!Schema::hasColumn('registrations', 'attendance_marked_at')) {
                $table->timestamp('attendance_marked_at')->nullable()->after('attendance');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['ban_reason']);
        });

        Schema::table('registrations', function (Blueprint $table) {
            $table->dropColumn(['user_id', 'status', 'attendance_marked_at']);
        });
    }
};