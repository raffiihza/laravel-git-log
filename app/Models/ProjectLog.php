<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectLog extends Model
{
    protected $fillable = [
        'name',
        'log_path',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
