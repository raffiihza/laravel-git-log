<?php

namespace App\Http\Controllers;

use App\Models\Repository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Process;
use Inertia\Inertia;

class GitLogController extends Controller
{
    // Timeout for git commands to prevent hanging
    private const GIT_TIMEOUT = 10; // 10 seconds max

    /**
     * Display the main git log dashboard (public route)
     */
    public function index()
    {
        // Only fetch repository metadata, not git logs
        // Git logs will be loaded asynchronously via API calls
        $repositories = Repository::select('id', 'name', 'git_log_path', 'description')
            ->orderBy('name')
            ->get();
        
        return Inertia::render('GitLog/Dashboard', [
            'repositories' => $repositories
        ]);
    }

    /**
     * Get git log for a specific repository
     * Optimized with timeout and minimal data fetching
     */
    public function getGitLog(Repository $repository, Request $request)
    {
        try {
            $validation = $this->validateRepository($repository->git_log_path);
            if ($validation !== true) {
                return $validation;
            }

            // Check if user wants to see all branches (optional)
            $showAllBranches = $request->query('all_branches', false);

            // Build git command
            $gitCommand = [
                'git', 
                '-c', "safe.directory={$repository->git_log_path}",
                '-c', 'core.preloadindex=true', // Speed up git operations
                '-c', 'core.fscache=true', // Enable filesystem cache
                'log', 
                '--graph', 
                '--pretty=format:%h (%an, %ar) %s%d', 
                '--abbrev-commit',
                '--date=relative',
                '--max-count=30'
            ];

            // Add --all flag only if requested
            if ($showAllBranches) {
                $gitCommand[] = '--all';
            }

            // Optimized git log command with timeout
            $result = Process::path($repository->git_log_path)
                ->timeout(self::GIT_TIMEOUT)
                ->run($gitCommand);

            if ($result->failed()) {
                return response()->json([
                    'error' => 'Failed to get git log: ' . $result->errorOutput()
                ], 500);
            }

            return response()->json([
                'repository' => $repository->only(['id', 'name', 'description']),
                'git_log' => $result->output(),
                'timestamp' => now()->toISOString()
            ]);

        } catch (\Symfony\Component\Process\Exception\ProcessTimedOutException $e) {
            return response()->json([
                'error' => 'Git command timed out. Repository might be too large or unresponsive.'
            ], 504);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'An error occurred: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get detailed git log for a specific repository
     * Optimized with timeout and limited commits
     */
    public function getDetailedGitLog(Repository $repository, Request $request)
    {
        try {
            $validation = $this->validateRepository($repository->git_log_path);
            if ($validation !== true) {
                return $validation;
            }

            // Check if user wants to see all branches (optional)
            $showAllBranches = $request->query('all_branches', false);

            // Build git command
            $gitCommand = [
                'git', 
                '-c', "safe.directory={$repository->git_log_path}",
                '-c', 'core.preloadindex=true',
                '-c', 'core.fscache=true',
                'log', 
                '--graph', 
                '--pretty=format:%h - %an, %ar : %s%n%b', 
                '--abbrev-commit',
                '--date=relative',
                '--max-count=20'
            ];

            // Add --all flag only if requested
            if ($showAllBranches) {
                $gitCommand[] = '--all';
            }

            // Optimized detailed git log with timeout
            $result = Process::path($repository->git_log_path)
                ->timeout(self::GIT_TIMEOUT)
                ->run($gitCommand);

            if ($result->failed()) {
                return response()->json([
                    'error' => 'Failed to get git log: ' . $result->errorOutput()
                ], 500);
            }

            return response()->json([
                'repository' => $repository->only(['id', 'name', 'description']),
                'git_log' => $result->output(),
                'timestamp' => now()->toISOString()
            ]);

        } catch (\Symfony\Component\Process\Exception\ProcessTimedOutException $e) {
            return response()->json([
                'error' => 'Git command timed out. Repository might be too large or unresponsive.'
            ], 504);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'An error occurred: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get complete git log showing all commits (no graph, just chronological)
     * Optimized without merge commits for faster response
     */
    public function getCompleteGitLog(Repository $repository, Request $request)
    {
        try {
            $validation = $this->validateRepository($repository->git_log_path);
            if ($validation !== true) {
                return $validation;
            }

            // Check if user wants to see all branches (optional)
            $showAllBranches = $request->query('all_branches', false);

            // Build git command
            $gitCommand = [
                'git', 
                '-c', "safe.directory={$repository->git_log_path}",
                '-c', 'core.preloadindex=true',
                '-c', 'core.fscache=true',
                'log', 
                '--pretty=format:%h (%an, %ar) %s%d', 
                '--abbrev-commit',
                '--date=relative',
                '--no-merges',
                '--max-count=30'
            ];

            // Add --all flag only if requested
            if ($showAllBranches) {
                $gitCommand[] = '--all';
            }

            // Optimized complete git log - no merges, faster parsing
            $result = Process::path($repository->git_log_path)
                ->timeout(self::GIT_TIMEOUT)
                ->run($gitCommand);

            if ($result->failed()) {
                return response()->json([
                    'error' => 'Failed to get git log: ' . $result->errorOutput()
                ], 500);
            }

            return response()->json([
                'repository' => $repository->only(['id', 'name', 'description']),
                'git_log' => $result->output(),
                'timestamp' => now()->toISOString()
            ]);

        } catch (\Symfony\Component\Process\Exception\ProcessTimedOutException $e) {
            return response()->json([
                'error' => 'Git command timed out. Repository might be too large or unresponsive.'
            ], 504);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'An error occurred: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Validate repository path and git directory
     * Returns true if valid, JsonResponse if invalid
     */
    private function validateRepository(string $gitPath)
    {
        if (!is_dir($gitPath)) {
            return response()->json([
                'error' => 'Repository path does not exist'
            ], 404);
        }

        if (!is_dir($gitPath . '/.git')) {
            return response()->json([
                'error' => 'Path is not a git repository'
            ], 400);
        }

        return true;
    }
}
