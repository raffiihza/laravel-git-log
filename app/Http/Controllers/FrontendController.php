<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Carbon\Carbon;
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
                    $carbonTime = Carbon::createFromTimestamp($modifiedTime, 'Asia/Jakarta');
                    $folders[] = [
                        'name' => basename($item),
                        'path' => $item,
                        'modified_at' => $modifiedTime,
                        'modified_at_formatted' => $carbonTime->format('M j H:i'),
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
                $carbonTime = Carbon::createFromTimestamp($modifiedTime, 'Asia/Jakarta');
                $folders[] = [
                    'name' => basename($item),
                    'path' => $item,
                    'modified_at' => $modifiedTime,
                    'modified_at_formatted' => $carbonTime->format('M j H:i'),
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
     * Convert timestamp to human readable time (Asia/Jakarta timezone)
     */
    private function humanReadableTime(int $timestamp): string
    {
        $carbonTime = Carbon::createFromTimestamp($timestamp, 'Asia/Jakarta');
        $now = Carbon::now('Asia/Jakarta');
        $diff = $now->diffInSeconds($carbonTime);
        
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
            return $carbonTime->format('M j, Y');
        }
    }
}
