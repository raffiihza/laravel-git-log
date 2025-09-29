# Git Log Dashboard - Admin Credentials

## Admin Login Information

Registration has been disabled for security. Use the following pre-created admin accounts to manage repositories:

### Primary Admin Account
- **Email**: `admin@gitlog.local`
- **Password**: `admin123`

### Developer Account  
- **Email**: `developer@gitlog.local`
- **Password**: `dev123`

## How to Use

1. **Public Access** (No login required):
   - Visit `/` to view the git log dashboard
   - Anyone can view git logs from configured repositories
   - Refresh functionality available to get latest logs

2. **Admin Access** (Login required):
   - Login with admin credentials above
   - Visit `/repositories` to manage repositories
   - Add, edit, or delete git repositories
   - Configure repository paths and descriptions

## Repository Configuration

When adding repositories, provide:
- **Name**: Display name for the repository
- **Git Log Path**: Full filesystem path to the git repository (must contain .git folder)
- **Description**: Optional description for the repository

## Security Notes

- User registration is disabled
- Only authenticated users can manage repositories
- Git log viewing is public (no authentication required)
- Repository paths are validated before executing git commands