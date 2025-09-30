<?php

use App\Http\Controllers\GitLogController;
use App\Http\Controllers\RepositoryController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public route for git log dashboard
Route::get('/', [GitLogController::class, 'index'])->name('home');

// API routes for git log data (public)
Route::get('/api/git-log/{repository}', [GitLogController::class, 'getGitLog'])->name('api.git-log');
Route::get('/api/git-log/{repository}/detailed', [GitLogController::class, 'getDetailedGitLog'])->name('api.git-log.detailed');
Route::get('/api/git-log/{repository}/complete', [GitLogController::class, 'getCompleteGitLog'])->name('api.git-log.complete');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    
    // Protected routes for repository CRUD
    Route::resource('repositories', RepositoryController::class);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
