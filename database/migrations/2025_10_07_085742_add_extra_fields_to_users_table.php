<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->unique()->after('email');
            $table->string('contactNo')->nullable()->after('username');
            $table->string('sex')->nullable()->after('contactNo');
            $table->date('dob')->nullable()->after('sex');
            $table->string('barangay')->nullable()->after('dob');
            $table->string('purok')->nullable()->after('barangay');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['username', 'contactNo', 'sex', 'dob', 'barangay', 'purok']);
        });
    }
};
