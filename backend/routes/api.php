<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\AdminUserController;


// PUBLIC ROUTES
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

// PROTECTED ROUTES (token required)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/categories', [CategoryController::class, 'store']);
    
    Route::apiResource('tasks', TaskController::class);

});

// ADMIN ROUTES
Route::middleware(['auth:sanctum', 'is_admin'])->get('/admin/users', [AdminUserController::class, 'index']);
Route::middleware(['auth:sanctum', 'is_admin'])->get('/admin/test', function () {
    return response()->json([
        'message' => 'Admin area working!'
    ]);
});

