<?php

namespace Database\Seeders;

use App\Models\Repository;
use Illuminate\Database\Seeder;

class RepositorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Repository::create([
            'name' => 'Laravel Git Log Dashboard',
            'git_log_path' => '/workspaces/laravel-git-log',
            'description' => 'This is the current Laravel application with React frontend for displaying git logs.',
        ]);
    }
}
