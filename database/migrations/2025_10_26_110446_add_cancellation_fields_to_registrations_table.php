<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('registrations', function (Blueprint $table) {
            $table->enum('status', ['registered', 'cancelled'])->default('registered');
            $table->string('cancellation_reason')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            
            // Only add timestamps if they don't exist
            if (!Schema::hasColumn('registrations', 'created_at')) {
                $table->timestamps();
            }
        });
    }

    public function down()
    {
        Schema::table('registrations', function (Blueprint $table) {
            $table->dropColumn(['status', 'cancellation_reason', 'cancelled_at']);
            
            // Only drop timestamps if we added them in this migration
            if (Schema::hasColumn('registrations', 'created_at') && 
                !Schema::hasColumn('registrations', 'created_at_before_this_migration')) {
                $table->dropTimestamps();
            }
        });
    }
};