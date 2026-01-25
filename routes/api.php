<?php

use App\Http\Controllers\FrontendController;
use App\Http\Controllers\GitLogController;
use App\Http\Controllers\ProjectLogController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group (no CSRF verification).
|
*/

// API routes for git log data (public but rate limited)
Route::middleware('throttle:30,1')->group(function () {
    Route::get('/git-log/{repository}', [GitLogController::class, 'getGitLog'])->name('api.git-log');
    Route::get('/git-log/{repository}/detailed', [GitLogController::class, 'getDetailedGitLog'])->name('api.git-log.detailed');
    Route::get('/git-log/{repository}/complete', [GitLogController::class, 'getCompleteGitLog'])->name('api.git-log.complete');
    Route::get('/frontend/folders', [FrontendController::class, 'getFolders'])->name('api.frontend.folders');
    Route::get('/project-logs/{projectLog}/files', [ProjectLogController::class, 'getPublicLogFiles'])->name('api.project-logs.files');
    Route::get('/project-logs/{projectLog}/content', [ProjectLogController::class, 'getLogContent'])->name('api.project-logs.content');
});

// API route for git pull (rate limited to 10 requests per minute)
Route::middleware('throttle:10,1')->group(function () {
    Route::post('/git-pull/{repository}', [GitLogController::class, 'gitPull'])->name('api.git-pull');
});
