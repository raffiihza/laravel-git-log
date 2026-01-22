# Git Pull Feature Setup Guide

This document explains how to configure the Git Pull feature in the Laravel Git Log application. This feature allows authenticated users to pull the latest changes from remote repositories directly through the web interface.

## Overview

The Git Pull feature uses a secure shell script that is executed via `sudo`. This approach ensures:
- Only authenticated users can trigger git pull
- The script runs with appropriate permissions
- Repository file ownership is maintained correctly
- Path traversal and injection attacks are prevented

## Prerequisites

- Linux server (Ubuntu/Debian recommended)
- Web server running as `www-data` user (or your configured web server user)
- Git installed on the server
- SSH keys or credentials configured for the repositories

## Installation Steps

### 1. Copy the Git Pull Script

Copy the provided script to a system location:

```bash
sudo cp scripts/git-pull.sh /usr/local/bin/git-pull.sh
```

### 2. Set Proper Ownership and Permissions

```bash
sudo chown root:root /usr/local/bin/git-pull.sh
sudo chmod 755 /usr/local/bin/git-pull.sh
```

### 3. Configure Sudoers

Edit the sudoers file using `visudo`:

```bash
sudo visudo
```

Add the following line at the end of the file:

```
www-data ALL=(ALL) NOPASSWD: /usr/local/bin/git-pull.sh
```

> **Note:** Replace `www-data` with your web server user if different (e.g., `nginx`, `apache`, or your application user).

### 4. Configure Environment Variable

Update your `.env` file with the script path:

```env
GIT_PULL_SCRIPT_PATH=/usr/local/bin/git-pull.sh
GIT_PULL_TIMEOUT=60
```

### 5. Clear Configuration Cache

```bash
php artisan config:clear
```

## Custom Script Location

If you need to use a different location for the script:

1. Copy the script to your preferred location:
   ```bash
   sudo cp scripts/git-pull.sh /your/custom/path/git-pull.sh
   ```

2. Update ownership and permissions:
   ```bash
   sudo chown root:root /your/custom/path/git-pull.sh
   sudo chmod 755 /your/custom/path/git-pull.sh
   ```

3. Update the sudoers configuration:
   ```bash
   sudo visudo
   # Add: www-data ALL=(ALL) NOPASSWD: /your/custom/path/git-pull.sh
   ```

4. Update your `.env` file:
   ```env
   GIT_PULL_SCRIPT_PATH=/your/custom/path/git-pull.sh
   ```

5. Clear configuration cache:
   ```bash
   php artisan config:clear
   ```

## Security Considerations

### Script Security

The `git-pull.sh` script includes several security measures:

1. **Absolute Path Validation**: Only accepts absolute paths to prevent relative path attacks
2. **Path Traversal Prevention**: Rejects paths containing `..`
3. **Directory Validation**: Verifies the path exists and is a directory
4. **Git Repository Validation**: Confirms the path is a valid git repository
5. **Safe Exit**: Uses `set -euo pipefail` to fail safely on errors

### Sudoers Security

- The sudoers entry is restricted to a specific script path
- Only the web server user can execute the script with sudo
- NOPASSWD is limited to this single script

### Application Security

- Only authenticated users can trigger git pull
- Rate limiting (10 requests per minute) prevents abuse
- CSRF protection on the API endpoint
- Timeout protection prevents hanging requests

## Troubleshooting

### "Git pull script not found"

Ensure the script is in the correct location and the path in `.env` matches:

```bash
ls -la /usr/local/bin/git-pull.sh
```

### "Git pull script is not executable"

Set the executable permission:

```bash
sudo chmod 755 /usr/local/bin/git-pull.sh
```

### "Permission denied" or sudo errors

1. Check visudo configuration:
   ```bash
   sudo visudo -c
   ```

2. Verify the web server user:
   ```bash
   ps aux | grep php
   ```

3. Test sudo manually:
   ```bash
   sudo -u www-data sudo /usr/local/bin/git-pull.sh /path/to/repo
   ```

### "Authentication required" errors

If your repositories require authentication:

1. For SSH-based repositories, ensure SSH keys are set up for the repository owner
2. For HTTPS repositories, configure git credential storage:
   ```bash
   git config --global credential.helper store
   ```

### Timeout errors

Increase the timeout in `.env`:

```env
GIT_PULL_TIMEOUT=120
```

## Multiple Repositories

The script is designed to work with any repository path passed as an argument. Each repository configured in the application can be pulled independently.

To add a new repository:
1. Add it through the admin interface
2. Ensure the web server user has appropriate permissions
3. Configure SSH keys or credentials as needed

## Using with Different Web Server Users

If your web server runs as a different user:

1. Identify the user:
   ```bash
   ps aux | grep -E 'php|nginx|apache' | grep -v grep
   ```

2. Update the sudoers entry:
   ```bash
   sudo visudo
   # Replace www-data with your user
   ```

Example for common setups:
- Apache: `www-data` (Debian/Ubuntu) or `apache` (CentOS/RHEL)
- Nginx with PHP-FPM: `www-data` or `nginx`
- Laravel Valet: Your local username
