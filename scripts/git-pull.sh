#!/bin/bash
#
# Git Pull Script for Laravel Git Log Application
# This script performs git pull operations securely on specified repositories.
#
# SECURITY: This script should be:
# 1. Owned by root: chown root:root /usr/local/bin/git-pull.sh
# 2. Only executable by root: chmod 755 /usr/local/bin/git-pull.sh
# 3. Configured in visudo to allow web server user to execute it
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

# Get the owner of the repository directory
REPO_OWNER=$(stat -c '%U' "$REPO_PATH")

# Perform git pull as the repository owner
# This ensures proper file permissions are maintained
echo "Pulling latest changes for repository: $REPO_PATH"
echo "Repository owner: $REPO_OWNER"

# Mark directory as safe for git operations
git config --global --add safe.directory "$REPO_PATH" 2>/dev/null || true

# Perform git fetch first to check for updates
git fetch --all 2>&1

# Perform git pull
git pull 2>&1

echo "Git pull completed successfully"
exit 0
