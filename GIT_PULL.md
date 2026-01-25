# Git Pull Feature Setup Guide

This document explains how to configure the Git Pull feature in the Laravel Git Log application. This feature allows authenticated users to pull the latest changes from remote repositories directly through the web interface.

## Overview

The Git Pull feature supports three execution modes:

1. **User Mode** (Recommended) - Runs as a specific user via sudo (not root)
2. **Sudo Mode** - Runs as root via sudo
3. **Direct Mode** - Runs directly as web server user (no sudo)

## Quick Start: User Mode (Recommended)

This mode uses visudo to allow the web server to run git pull as a specific non-root user (the user who owns the repositories).

**Example scenario**: You have user `abc` who cloned all repositories. The web server runs as `www-data`. With this setup, `www-data` can run git pull as user `abc`.

### Prerequisites

- Linux server (Ubuntu/Debian recommended)
- A regular user account that owns the git repositories (e.g., `abc`)
- SSH keys or git credentials configured for that user
- Root access to configure visudo

### Installation Steps

#### 1. Copy the Script

```bash
sudo cp scripts/git-pull-user.sh /usr/local/bin/git-pull-user.sh
sudo chmod 755 /usr/local/bin/git-pull-user.sh
```

#### 2. Configure Sudoers

Edit the sudoers file using `visudo`:

```bash
sudo visudo
```

Add the following line (replace `abc` with your repository owner username):

```
www-data ALL=(abc) NOPASSWD: /usr/local/bin/git-pull-user.sh
```

This allows `www-data` to run the script as user `abc` without a password.

> **Note:** Replace `www-data` with your web server user if different (e.g., `nginx`, `apache`).

#### 3. Configure Environment Variables

Update your `.env` file:

```env
GIT_PULL_MODE=user
GIT_PULL_USER=abc
GIT_PULL_SCRIPT_PATH=/usr/local/bin/git-pull-user.sh
GIT_PULL_TIMEOUT=60
```

#### 4. Configure SSH Keys

Ensure the repository owner has SSH keys configured:

```bash
# Check if SSH keys exist for user abc
sudo ls -la /home/abc/.ssh/

# If not, generate SSH keys
sudo -u abc ssh-keygen -t ed25519 -f /home/abc/.ssh/id_ed25519 -N ""

# Add the public key to your Git server (GitHub, GitLab, etc.)
sudo cat /home/abc/.ssh/id_ed25519.pub
```

#### 5. Clear Configuration Cache

```bash
php artisan config:clear
```

#### 6. Test the Setup

Test that the web server user can run the script as the target user:

```bash
sudo -u www-data sudo -u abc /usr/local/bin/git-pull-user.sh /path/to/your/repo
```

---

## Alternative: Sudo Mode (Root)

Use this mode if you need the script to run as root (for advanced use cases).

### Installation Steps

#### 1. Copy the Script

```bash
sudo cp scripts/git-pull.sh /usr/local/bin/git-pull.sh
sudo chown root:root /usr/local/bin/git-pull.sh
sudo chmod 755 /usr/local/bin/git-pull.sh
```

#### 2. Configure Sudoers

```bash
sudo visudo
```

Add:

```
www-data ALL=(ALL) NOPASSWD: /usr/local/bin/git-pull.sh
```

#### 3. Configure Environment Variables

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

## Alternative: Direct Mode (No Sudo)

Use this mode if you don't want to use sudo at all. The web server user must have direct write access to repositories.

### Installation Steps

#### 1. Copy the Script

```bash
sudo cp scripts/git-pull-user.sh /usr/local/bin/git-pull-user.sh
sudo chmod 755 /usr/local/bin/git-pull-user.sh
```

#### 2. Set Repository Permissions

Make the web server user the owner of repositories:

```bash
sudo chown -R www-data:www-data /path/to/your/repository
```

Or add www-data to the repository owner's group:

```bash
sudo usermod -aG your_username www-data
sudo chmod -R g+w /path/to/your/repository
```

#### 3. Configure SSH Keys for www-data

```bash
sudo mkdir -p /var/www/.ssh
sudo chown www-data:www-data /var/www/.ssh
sudo chmod 700 /var/www/.ssh
sudo -u www-data ssh-keygen -t ed25519 -f /var/www/.ssh/id_ed25519 -N ""
sudo cat /var/www/.ssh/id_ed25519.pub
```

#### 4. Configure Environment Variables

```env
GIT_PULL_MODE=direct
GIT_PULL_SCRIPT_PATH=/usr/local/bin/git-pull-user.sh
GIT_PULL_TIMEOUT=60
```

#### 5. Clear Configuration Cache

```bash
php artisan config:clear
```

---

## Comparison of Modes

| Feature | User Mode | Sudo Mode | Direct Mode |
|---------|-----------|-----------|-------------|
| Runs as | Specific user (e.g., `abc`) | Root | Web server user |
| Visudo required | Yes | Yes | No |
| Root access needed | For visudo setup only | Yes | No |
| SSH keys location | User's home (e.g., `/home/abc/.ssh`) | Varies | `/var/www/.ssh` |
| Recommended for | Most setups | Advanced cases | Simple setups |

**Recommendation**: Use **User Mode** for the best balance of security and functionality.

---

## Security Considerations

### Script Security

All scripts include:

1. **Absolute Path Validation**: Only accepts absolute paths
2. **Path Traversal Prevention**: Rejects paths containing `..`
3. **Directory Validation**: Verifies the path exists and is a directory
4. **Git Repository Validation**: Confirms the path is a valid git repository
5. **Safe Exit**: Uses `set -euo pipefail` to fail safely on errors

### Visudo Security (User/Sudo Modes)

- The sudoers entry is restricted to a specific script path
- In User Mode, execution is limited to a specific non-root user
- NOPASSWD is limited to this single script

### Application Security

- Only authenticated users can trigger git pull
- Rate limiting (10 requests per minute) prevents abuse
- CSRF protection on the API endpoint
- Timeout protection prevents hanging requests

---

## Troubleshooting

### "Git pull script not found"

Ensure the script is in the correct location:

```bash
ls -la /usr/local/bin/git-pull-user.sh
```

### "Git pull script is not executable"

```bash
sudo chmod 755 /usr/local/bin/git-pull-user.sh
```

### "Permission denied" or sudo errors

1. Check visudo configuration:
   ```bash
   sudo visudo -c
   ```

2. Verify the sudoers entry is correct:
   ```bash
   sudo cat /etc/sudoers | grep git-pull
   ```

3. Test manually:
   ```bash
   # For User Mode:
   sudo -u www-data sudo -u abc /usr/local/bin/git-pull-user.sh /path/to/repo
   
   # For Sudo Mode:
   sudo -u www-data sudo /usr/local/bin/git-pull.sh /path/to/repo
   ```

### "Authentication required" errors

Ensure SSH keys are set up for the correct user:

```bash
# For User Mode (as user abc):
sudo -u abc ssh -T git@github.com

# For Direct Mode (as www-data):
sudo -u www-data ssh -T git@github.com
```

### Timeout errors

Increase the timeout in `.env`:

```env
GIT_PULL_TIMEOUT=120
```

---

## Multiple Repositories

The script works with any repository path. Each repository in the application can be pulled independently.

To add a new repository:
1. Add it through the admin interface
2. Ensure the target user has access to the repository
3. Verify SSH keys or credentials are configured
