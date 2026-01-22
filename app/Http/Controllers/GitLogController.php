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
     * Execute git pull for a specific repository
     * Protected route - requires authentication
     */
    public function gitPull(Repository $repository)
    {
        try {
            $validation = $this->validateRepository($repository->git_log_path);
            if ($validation !== true) {
                return $validation;
            }

            $scriptPath = config('gitpull.script_path');
            $timeout = config('gitpull.timeout', 60);

            // Security: Validate script path doesn't contain shell injection characters
            if (!$this->isValidScriptPath($scriptPath)) {
                return response()->json([
                    'error' => 'Invalid script path configuration. Please check GIT_PULL.md for setup instructions.'
                ], 500);
            }

            // Security: Validate script path exists
            if (!file_exists($scriptPath)) {
                return response()->json([
                    'error' => 'Git pull script not found. Please check GIT_PULL.md for setup instructions.',
                    'script_path' => $scriptPath
                ], 500);
            }

            // Security: Validate script is executable
            if (!is_executable($scriptPath)) {
                return response()->json([
                    'error' => 'Git pull script is not executable. Please check GIT_PULL.md for setup instructions.'
                ], 500);
            }

            // Security: Validate repository path for shell injection
            $repoPath = $repository->git_log_path;
            if (!$this->isValidRepoPath($repoPath)) {
                return response()->json([
                    'error' => 'Invalid repository path.'
                ], 400);
            }

            // Get execution mode (sudo or user)
            $mode = config('gitpull.mode', 'sudo');

            // Execute git pull script with repository path as argument
            if ($mode === 'user') {
                // User mode: Run script directly without sudo (simpler, no root needed)
                $result = Process::timeout($timeout)
                    ->run([$scriptPath, $repoPath]);
            } else {
                // Sudo mode: Run script with sudo (requires visudo configuration)
                $result = Process::timeout($timeout)
                    ->run(['sudo', $scriptPath, $repoPath]);
            }

            if ($result->failed()) {
                return response()->json([
                    'error' => 'Git pull failed: ' . $result->errorOutput(),
                    'output' => $result->output()
                ], 500);
            }

            return response()->json([
                'success' => true,
                'message' => 'Git pull completed successfully',
                'repository' => $repository->only(['id', 'name', 'description']),
                'output' => $result->output(),
                'timestamp' => now()->toISOString()
            ]);

        } catch (\Symfony\Component\Process\Exception\ProcessTimedOutException $e) {
            return response()->json([
                'error' => 'Git pull timed out. The repository might be large or the network is slow.'
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

    /**
     * Validate script path for shell injection
     * Only allow absolute paths with alphanumeric, /, -, _, and . characters
     */
    private function isValidScriptPath(string $path): bool
    {
        // Must be absolute path
        if (!str_starts_with($path, '/')) {
            return false;
        }

        // Only allow safe characters in path
        if (!preg_match('/^[a-zA-Z0-9\/_\-\.]+$/', $path)) {
            return false;
        }

        // Prevent path traversal
        if (str_contains($path, '..')) {
            return false;
        }

        return true;
    }

    /**
     * Validate repository path for shell injection
     * Only allow absolute paths with safe characters
     */
    private function isValidRepoPath(string $path): bool
    {
        // Must be absolute path
        if (!str_starts_with($path, '/')) {
            return false;
        }

        // Only allow safe characters (alphanumeric, /, -, _, ., space)
        if (!preg_match('/^[a-zA-Z0-9\/_\-\.\s]+$/', $path)) {
            return false;
        }

        // Prevent path traversal
        if (str_contains($path, '..')) {
            return false;
        }

        return true;
    }
}
