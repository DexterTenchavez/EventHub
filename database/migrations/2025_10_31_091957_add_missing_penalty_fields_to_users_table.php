<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Only add penalty_expires_at if it doesn't exist
            if (!Schema::hasColumn('users', 'penalty_expires_at')) {
                $table->timestamp('penalty_expires_at')->nullable()->after('penalties');
            }
            
            // Only add banned_until if it doesn't exist
            if (!Schema::hasColumn('users', 'banned_until')) {
                $table->timestamp('banned_until')->nullable()->after('penalty_expires_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Only drop the columns we're adding in this migration
            if (Schema::hasColumn('users', 'penalty_expires_at')) {
                $table->dropColumn('penalty_expires_at');
            }
            
            if (Schema::hasColumn('users', 'banned_until')) {
                $table->dropColumn('banned_until');
            }
        });
    }
};