<?php

namespace App\Http\Controllers;

use App\Models\ProjectLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;

class ProjectLogController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $projectLogs = ProjectLog::all();
        
        return Inertia::render('ProjectLogs/Index', [
            'projectLogs' => $projectLogs
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('ProjectLogs/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'log_path' => 'required|string',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;

        ProjectLog::create($validated);

        return redirect()->route('project-logs.manage.index')
            ->with('success', 'Project log created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(ProjectLog $projectLog)
    {
        $logFiles = $this->getLogFiles($projectLog->log_path);
        
        return Inertia::render('ProjectLogs/Show', [
            'projectLog' => $projectLog,
            'logFiles' => $logFiles
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ProjectLog $projectLog)
    {
        return Inertia::render('ProjectLogs/Edit', [
            'projectLog' => $projectLog
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ProjectLog $projectLog)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'log_path' => 'required|string',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $projectLog->update($validated);

        return redirect()->route('project-logs.manage.index')
            ->with('success', 'Project log updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProjectLog $projectLog)
    {
        $projectLog->delete();

        return redirect()->route('project-logs.manage.index')
            ->with('success', 'Project log deleted successfully.');
    }

    /**
     * Get log files from a directory
     */
    private function getLogFiles(string $path): array
    {
        if (!File::isDirectory($path)) {
            return [];
        }

        $files = File::files($path);
        $logFiles = [];

        foreach ($files as $file) {
            // Only include log files
            if (in_array($file->getExtension(), ['log', 'txt', 'php'])) {
                $logFiles[] = [
                    'name' => $file->getFilename(),
                    'path' => $file->getPathname(),
                    'size' => $file->getSize(),
                    'modified' => $file->getMTime(),
                    'modified_formatted' => date('Y-m-d H:i:s', $file->getMTime()),
                ];
            }
        }

        // Sort by modified time, newest first
        usort($logFiles, function ($a, $b) {
            return $b['modified'] - $a['modified'];
        });

        return $logFiles;
    }

    /**
     * Get the content of a specific log file
     */
    public function getLogContent(ProjectLog $projectLog, Request $request)
    {
        $filename = $request->query('file');
        
        if (!$filename) {
            return response()->json(['error' => 'File name is required'], 400);
        }

        $filePath = rtrim($projectLog->log_path, '/') . '/' . basename($filename);

        if (!File::exists($filePath)) {
            return response()->json(['error' => 'File not found'], 404);
        }

        // Security check: make sure the file is within the log path
        $realLogPath = realpath($projectLog->log_path);
        $realFilePath = realpath($filePath);
        
        if ($realLogPath === false || $realFilePath === false || !str_starts_with($realFilePath, $realLogPath)) {
            return response()->json(['error' => 'Access denied'], 403);
        }

        try {
            $content = File::get($filePath);
            
            // Reverse the content (newest entries at top)
            $lines = explode("\n", $content);
            $reversedLines = array_reverse($lines);
            $reversedContent = implode("\n", $reversedLines);
            
            return response()->json([
                'content' => $reversedContent,
                'filename' => $filename,
                'size' => File::size($filePath),
                'modified' => date('Y-m-d H:i:s', File::lastModified($filePath)),
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to read file: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Public view of active project logs
     */
    public function publicIndex()
    {
        $projectLogs = ProjectLog::where('is_active', true)->get();
        
        return Inertia::render('ProjectLogs/Public', [
            'projectLogs' => $projectLogs
        ]);
    }

    /**
     * Get log files for a public project log
     */
    public function getPublicLogFiles(ProjectLog $projectLog)
    {
        if (!$projectLog->is_active) {
            return response()->json(['error' => 'Project log not active'], 404);
        }

        $logFiles = $this->getLogFiles($projectLog->log_path);
        
        return response()->json([
            'projectLog' => $projectLog,
            'logFiles' => $logFiles
        ]);
    }
}
