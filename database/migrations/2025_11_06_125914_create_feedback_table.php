<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('feedback', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('user_name');
            $table->string('user_email');
            $table->integer('rating'); // 1-5 stars
            $table->text('comment')->nullable();
            $table->string('event_title');
            $table->string('event_category');
            $table->timestamps();
            
            // Prevent duplicate feedback from same user for same event
            $table->unique(['event_id', 'user_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('feedback');
    }
};