<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Git Pull Script Path
    |--------------------------------------------------------------------------
    |
    | This is the path to the shell script that will be executed to perform
    | git pull operations. 
    |
    | For 'sudo' mode: Use git-pull.sh (requires visudo configuration)
    | For 'user' mode: Use git-pull-user.sh (no root access needed)
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

    /*
    |--------------------------------------------------------------------------
    | Git Pull Mode
    |--------------------------------------------------------------------------
    |
    | Execution mode for the git pull script:
    |
    | 'sudo' - Run script with sudo (requires visudo configuration, runs as root)
    | 'user' - Run script directly as web server user (no root access needed)
    |
    | Use 'user' mode if you don't want to configure visudo or run as root.
    | Make sure the web server user has write access to the repositories.
    |
    */
    'mode' => env('GIT_PULL_MODE', 'sudo'),
];
