<?php

use Illuminate\Support\Facades\Route;


// This route returns your React view
Route::get('/', function () {
    return view('react');
});

