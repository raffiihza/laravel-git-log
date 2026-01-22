# Git Pull Feature Setup Guide

This document explains how to configure the Git Pull feature in the Laravel Git Log application. This feature allows authenticated users to pull the latest changes from remote repositories directly through the web interface.

## Overview

The Git Pull feature supports two execution modes:

1. **User Mode** (Recommended for simplicity) - Runs as the web server user, no root access needed
2. **Sudo Mode** - Runs with elevated privileges via sudo/visudo

## Quick Start: User Mode (Recommended)

This is the simplest setup that doesn't require root access or visudo configuration.

### Prerequisites

- The web server user (e.g., `www-data`) must have read/write access to the repositories
- SSH keys or git credentials must be configured for the web server user

### Installation Steps

#### 1. Copy the User Mode Script

```bash
sudo cp scripts/git-pull-user.sh /usr/local/bin/git-pull-user.sh
sudo chmod 755 /usr/local/bin/git-pull-user.sh
```

#### 2. Set Repository Permissions

Make sure the web server user can write to your repositories:

```bash
# Option A: Add www-data to the repository owner's group
sudo usermod -aG your_username www-data

# Option B: Change repository ownership
sudo chown -R www-data:www-data /path/to/your/repository
```

#### 3. Configure SSH Keys (for private repositories)

Set up SSH keys for the web server user:

```bash
# Create SSH directory for www-data
sudo mkdir -p /var/www/.ssh
sudo chown www-data:www-data /var/www/.ssh
sudo chmod 700 /var/www/.ssh

# Generate SSH key for www-data
sudo -u www-data ssh-keygen -t ed25519 -f /var/www/.ssh/id_ed25519 -N ""

# Add the public key to your Git server (GitHub, GitLab, etc.)
sudo cat /var/www/.ssh/id_ed25519.pub
```

#### 4. Configure Environment Variables

Update your `.env` file:

```env
GIT_PULL_MODE=user
GIT_PULL_SCRIPT_PATH=/usr/local/bin/git-pull-user.sh
GIT_PULL_TIMEOUT=60
```

#### 5. Clear Configuration Cache

```bash
php artisan config:clear
```

---

## Alternative: Sudo Mode

Use this mode if you need the script to run with elevated privileges (e.g., when repositories are owned by different users).

### Prerequisites

- Linux server (Ubuntu/Debian recommended)
- Web server running as `www-data` user (or your configured web server user)
- Git installed on the server
- Root access for visudo configuration

### Installation Steps

#### 1. Copy the Sudo Mode Script

```bash
sudo cp scripts/git-pull.sh /usr/local/bin/git-pull.sh
sudo chown root:root /usr/local/bin/git-pull.sh
sudo chmod 755 /usr/local/bin/git-pull.sh
```

#### 2. Configure Sudoers

Edit the sudoers file using `visudo`:

```bash
sudo visudo
```

Add the following line at the end of the file:

```
www-data ALL=(ALL) NOPASSWD: /usr/local/bin/git-pull.sh
```

> **Note:** Replace `www-data` with your web server user if different (e.g., `nginx`, `apache`, or your application user).

#### 3. Configure Environment Variables

Update your `.env` file:

```env
GIT_PULL_MODE=sudo
GIT_PULL_SCRIPT_PATH=/usr/local/bin/git-pull.sh
GIT_PULL_TIMEOUT=60
```

#### 4. Clear Configuration Cache

```bash
php artisan config:clear
```

---

## Security Considerations

### User Mode Security

- The web server user must have write access to repositories
- SSH keys should be protected with proper permissions (600)
- Only authenticated application users can trigger git pull
- Rate limiting (10 requests per minute) prevents abuse

### Sudo Mode Security

- The sudoers entry is restricted to a specific script path
- Only the web server user can execute the script with sudo
- NOPASSWD is limited to this single script
- The script validates all input paths

### Common Security Features

Both scripts include:

1. **Absolute Path Validation**: Only accepts absolute paths
2. **Path Traversal Prevention**: Rejects paths containing `..`
3. **Directory Validation**: Verifies the path exists and is a directory
4. **Git Repository Validation**: Confirms the path is a valid git repository
5. **Safe Exit**: Uses `set -euo pipefail` to fail safely on errors

---

## Troubleshooting

### "Git pull script not found"

Ensure the script is in the correct location:

```bash
ls -la /usr/local/bin/git-pull-user.sh  # For user mode
ls -la /usr/local/bin/git-pull.sh       # For sudo mode
```

### "Git pull script is not executable"

Set the executable permission:

```bash
sudo chmod 755 /usr/local/bin/git-pull-user.sh
```

### "Permission denied" errors (User Mode)

1. Check repository permissions:
   ```bash
   ls -la /path/to/repository
   ```

2. Add web server user to the correct group:
   ```bash
   sudo usermod -aG your_username www-data
   ```

3. Restart the web server:
   ```bash
   sudo systemctl restart php-fpm
   sudo systemctl restart nginx  # or apache2
   ```

### "Authentication required" errors

If your repositories require authentication:

1. For SSH-based repositories, ensure SSH keys are set up for the correct user
2. For HTTPS repositories, configure git credential storage:
   ```bash
   sudo -u www-data git config --global credential.helper store
   ```

### Timeout errors

Increase the timeout in `.env`:

```env
GIT_PULL_TIMEOUT=120
```

---

## Comparison: User Mode vs Sudo Mode

| Feature | User Mode | Sudo Mode |
|---------|-----------|-----------|
| Root access needed | No | Yes |
| Visudo configuration | No | Yes |
| Complexity | Simple | More complex |
| Repository ownership | Must be writable by www-data | Can be any user |
| Security | Less privileged | More privileged |

**Recommendation**: Use **User Mode** unless you specifically need to pull repositories owned by different system users.

---

## Multiple Repositories

The script is designed to work with any repository path passed as an argument. Each repository configured in the application can be pulled independently.

To add a new repository:
1. Add it through the admin interface
2. Ensure the web server user has appropriate permissions (for User Mode)
3. Configure SSH keys or credentials as needed
