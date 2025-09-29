<?php

namespace App\Http\Controllers;

use App\Models\Repository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Process;
use Inertia\Inertia;

class GitLogController extends Controller
{
    /**
     * Display the main git log dashboard (public route)
     */
    public function index()
    {
        $repositories = Repository::all();
        
        return Inertia::render('GitLog/Dashboard', [
            'repositories' => $repositories
        ]);
    }

    /**
     * Get git log for a specific repository
     */
    public function getGitLog(Repository $repository)
    {
        try {
            // Validate that the path exists and is a git repository
            if (!is_dir($repository->git_log_path)) {
                return response()->json([
                    'error' => 'Repository path does not exist'
                ], 404);
            }

            if (!is_dir($repository->git_log_path . '/.git')) {
                return response()->json([
                    'error' => 'Path is not a git repository'
                ], 400);
            }

            // Get git log with formatting
            $result = Process::path($repository->git_log_path)
                ->run(['git', 'log', '--oneline', '--graph', '--decorate', '--all', '-20']);

            if ($result->failed()) {
                return response()->json([
                    'error' => 'Failed to get git log: ' . $result->errorOutput()
                ], 500);
            }

            return response()->json([
                'repository' => $repository,
                'git_log' => $result->output()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'An error occurred: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get detailed git log for a specific repository
     */
    public function getDetailedGitLog(Repository $repository)
    {
        try {
            // Validate that the path exists and is a git repository
            if (!is_dir($repository->git_log_path)) {
                return response()->json([
                    'error' => 'Repository path does not exist'
                ], 404);
            }

            if (!is_dir($repository->git_log_path . '/.git')) {
                return response()->json([
                    'error' => 'Path is not a git repository'
                ], 400);
            }

            // Get detailed git log with formatting
            $result = Process::path($repository->git_log_path)
                ->run(['git', 'log', '--graph', '--pretty=format:%h - %an, %ar : %s', '--abbrev-commit', '-10']);

            if ($result->failed()) {
                return response()->json([
                    'error' => 'Failed to get git log: ' . $result->errorOutput()
                ], 500);
            }

            return response()->json([
                'repository' => $repository,
                'git_log' => $result->output()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'An error occurred: ' . $e->getMessage()
            ], 500);
        }
    }
}
