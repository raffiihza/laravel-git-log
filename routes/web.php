<?php

use App\Http\Controllers\FrontendController;
use App\Http\Controllers\GitLogController;
use App\Http\Controllers\ProjectLogController;
use App\Http\Controllers\RepositoryController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public route for git log dashboard
Route::get('/', [GitLogController::class, 'index'])->name('home');

// Public route for frontend projects dashboard
Route::get('/frontend', [FrontendController::class, 'index'])->name('frontend.index');

// Public route for project logs dashboard
Route::get('/project-logs', [ProjectLogController::class, 'publicIndex'])->name('project-logs.public');

// Public route for viewing individual log file
Route::get('/project-logs/{projectLog}/view', [ProjectLogController::class, 'viewLogFile'])->name('project-logs.view');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    
    // Protected routes for repository CRUD
    Route::resource('repositories', RepositoryController::class);

    // Protected routes for project logs CRUD
    Route::resource('project-logs/manage', ProjectLogController::class, ['as' => 'project-logs', 'parameters' => ['manage' => 'projectLog']]);

    // Frontend settings (admin only)
    Route::get('/frontend/settings', [FrontendController::class, 'settings'])->name('frontend.settings');
    Route::post('/frontend/settings', [FrontendController::class, 'updateSettings'])->name('frontend.settings.update');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
