<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@gitlog.local'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('admin123'),
                'email_verified_at' => now(),
            ]
        );

        // Create a developer user as well
        User::firstOrCreate(
            ['email' => 'developer@gitlog.local'],
            [
                'name' => 'Developer',
                'password' => Hash::make('dev123'),
                'email_verified_at' => now(),
            ]
        );
    }
}
