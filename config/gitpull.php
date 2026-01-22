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
    | See GIT_PULL.md for detailed setup instructions.
    |
    */
    'script_path' => env('GIT_PULL_SCRIPT_PATH', '/usr/local/bin/git-pull-user.sh'),

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
    | 'user' - Run script with sudo as a specific user (recommended)
    |          Requires visudo configuration to allow running as GIT_PULL_USER
    |          Example: www-data ALL=(abc) NOPASSWD: /usr/local/bin/git-pull-user.sh
    |
    | 'sudo' - Run script with sudo as root (for advanced use cases)
    |          Requires visudo configuration to allow running as root
    |          Example: www-data ALL=(ALL) NOPASSWD: /usr/local/bin/git-pull.sh
    |
    | 'direct' - Run script directly as web server user (no sudo needed)
    |            Web server user must have write access to repositories
    |
    */
    'mode' => env('GIT_PULL_MODE', 'user'),

    /*
    |--------------------------------------------------------------------------
    | Git Pull User
    |--------------------------------------------------------------------------
    |
    | The username to run git pull as when using 'user' mode.
    | This should be the user who owns the git repositories.
    |
    | Example: If you cloned repos as user 'abc', set this to 'abc'.
    | The visudo entry should be: www-data ALL=(abc) NOPASSWD: /path/to/script
    |
    */
    'user' => env('GIT_PULL_USER', 'www-data'),
];
