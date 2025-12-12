<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\AdminTaskController;
use App\Http\Controllers\AdminDashboardController;


// PUBLIC ROUTES
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// PROTECTED ROUTES (token required)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/categories', [CategoryController::class, 'store']);
    
    Route::apiResource('tasks', TaskController::class);

});

// ADMIN ROUTES
Route::middleware(['auth:sanctum', 'is_admin'])
    ->prefix('admin')
    ->group(function () {

        Route::get('/test', function () {
            return response()->json([
                'message' => 'Admin area working!'
            ]);
        });

        // USERS
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::post('/users', [AdminUserController::class, 'store']);
        Route::get('/users/{id}', [AdminUserController::class, 'show']);
        Route::put('/users/{id}', [AdminUserController::class, 'update']);
        Route::put('/users/{id}/admin', [AdminUserController::class, 'setAdmin']);
        Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);

        // TASKS
        Route::get('/tasks/{id}', [AdminTaskController::class, 'show']);  
        Route::put('/tasks/{id}', [AdminTaskController::class, 'update']);
        Route::get('/tasks', [AdminTaskController::class, 'index']);
        Route::delete('/tasks/{id}', [AdminTaskController::class, 'destroy']);
        Route::get('/dashboard-stats', [AdminDashboardController::class, 'stats']);

    });


