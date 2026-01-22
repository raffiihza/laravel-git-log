#!/bin/bash
#
# Git Pull Script for Laravel Git Log Application (User Mode)
# This script performs git pull operations WITHOUT requiring root/sudo.
#
# REQUIREMENTS:
# 1. The web server user must have read/write access to the repository
# 2. SSH keys or git credentials must be configured for the web server user
# 3. The repository must be owned by or accessible to the web server user
#
# See GIT_PULL.md for detailed setup instructions.

set -euo pipefail

# Validate arguments
if [ $# -lt 1 ]; then
    echo "Error: Repository path is required"
    echo "Usage: $0 <repository_path>"
    exit 1
fi

REPO_PATH="$1"

# Security: Validate repository path
# Only allow absolute paths
if [[ ! "$REPO_PATH" =~ ^/ ]]; then
    echo "Error: Repository path must be an absolute path"
    exit 1
fi

# Security: Prevent path traversal attacks
if [[ "$REPO_PATH" =~ \.\. ]]; then
    echo "Error: Path traversal not allowed"
    exit 1
fi

# Security: Check if path exists and is a directory
if [ ! -d "$REPO_PATH" ]; then
    echo "Error: Repository path does not exist: $REPO_PATH"
    exit 1
fi

# Security: Check if it's a valid git repository
if [ ! -d "$REPO_PATH/.git" ]; then
    echo "Error: Not a valid git repository: $REPO_PATH"
    exit 1
fi

# Change to repository directory
cd "$REPO_PATH" || exit 1

echo "Pulling latest changes for repository: $REPO_PATH"

# Perform git fetch first to check for updates
# Use -c option to set safe.directory for this command only (not global)
echo "Fetching updates..."
git -c "safe.directory=$REPO_PATH" fetch --all 2>&1

# Perform git pull
echo "Pulling changes..."
git -c "safe.directory=$REPO_PATH" pull 2>&1

echo "Git pull completed successfully"
exit 0
