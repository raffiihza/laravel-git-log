<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Git Pull Script Path
    |--------------------------------------------------------------------------
    |
    | This is the path to the shell script that will be executed to perform
    | git pull operations. This script must be configured in visudo to allow
    | the web server user to execute it as the repository owner.
    |
    | See GIT_PULL.md for detailed setup instructions.
    |
    */
    'script_path' => env('GIT_PULL_SCRIPT_PATH', '/usr/local/bin/git-pull.sh'),

    /*
    |--------------------------------------------------------------------------
    | Git Pull Timeout
    |--------------------------------------------------------------------------
    |
    | Maximum time in seconds to wait for git pull command to complete.
    | Increase this value for large repositories or slow networks.
    |
    */
    'timeout' => env('GIT_PULL_TIMEOUT', 60),
];
