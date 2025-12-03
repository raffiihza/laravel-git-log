<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;

class FrontendController extends Controller
{
    /**
     * Display the frontend projects dashboard (public route)
     */
    public function index()
    {
        $frontendPath = Setting::getValue('frontend_folder_path', '');
        $folders = [];
        $error = null;

        if (!empty($frontendPath)) {
            if (File::isDirectory($frontendPath)) {
                $items = File::directories($frontendPath);
                
                foreach ($items as $item) {
                    $modifiedTime = File::lastModified($item);
                    $folders[] = [
                        'name' => basename($item),
                        'path' => $item,
                        'modified_at' => $modifiedTime,
                        'modified_at_formatted' => date('M j H:i', $modifiedTime),
                        'modified_at_human' => $this->humanReadableTime($modifiedTime),
                    ];
                }

                // Sort by modification time (newest first)
                usort($folders, fn($a, $b) => $b['modified_at'] - $a['modified_at']);
            } else {
                $error = 'Frontend folder path does not exist or is not a directory.';
            }
        }

        return Inertia::render('Frontend/Dashboard', [
            'folders' => $folders,
            'frontendPath' => $frontendPath,
            'error' => $error,
        ]);
    }

    /**
     * Get folder contents via API (for refresh)
     */
    public function getFolders()
    {
        $frontendPath = Setting::getValue('frontend_folder_path', '');
        $folders = [];

        if (!empty($frontendPath) && File::isDirectory($frontendPath)) {
            $items = File::directories($frontendPath);
            
            foreach ($items as $item) {
                $modifiedTime = File::lastModified($item);
                $folders[] = [
                    'name' => basename($item),
                    'path' => $item,
                    'modified_at' => $modifiedTime,
                    'modified_at_formatted' => date('M j H:i', $modifiedTime),
                    'modified_at_human' => $this->humanReadableTime($modifiedTime),
                ];
            }

            // Sort by modification time (newest first)
            usort($folders, fn($a, $b) => $b['modified_at'] - $a['modified_at']);
        }

        return response()->json([
            'folders' => $folders,
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * Show the settings page for configuring frontend folder path (admin only)
     */
    public function settings()
    {
        $frontendPath = Setting::getValue('frontend_folder_path', '');

        return Inertia::render('Frontend/Settings', [
            'frontendPath' => $frontendPath,
        ]);
    }

    /**
     * Update the frontend folder path setting
     */
    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'frontend_folder_path' => 'required|string',
        ]);

        // Verify the path exists
        if (!File::isDirectory($validated['frontend_folder_path'])) {
            return back()->withErrors([
                'frontend_folder_path' => 'The specified path does not exist or is not a directory.',
            ]);
        }

        Setting::setValue(
            'frontend_folder_path',
            $validated['frontend_folder_path'],
            'Path to the frontend projects folder'
        );

        return redirect()->route('frontend.settings')
            ->with('success', 'Frontend folder path updated successfully.');
    }

    /**
     * Convert timestamp to human readable time
     */
    private function humanReadableTime(int $timestamp): string
    {
        $diff = time() - $timestamp;
        
        if ($diff < 60) {
            return 'Just now';
        } elseif ($diff < 3600) {
            $mins = floor($diff / 60);
            return $mins . ' minute' . ($mins > 1 ? 's' : '') . ' ago';
        } elseif ($diff < 86400) {
            $hours = floor($diff / 3600);
            return $hours . ' hour' . ($hours > 1 ? 's' : '') . ' ago';
        } elseif ($diff < 604800) {
            $days = floor($diff / 86400);
            return $days . ' day' . ($days > 1 ? 's' : '') . ' ago';
        } else {
            return date('M j, Y', $timestamp);
        }
    }
}
