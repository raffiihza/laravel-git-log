# Git Log Dashboard - Quick Start Guide

## 🚀 For Your Coworkers

### Viewing Git Logs (No Login Required)

1. **Visit the Dashboard**: Open `/` in your browser
2. **Select a Repository**: Click on any repository from the list
3. **View Git Log**: See the current branch commits instantly

### View Modes

#### 📊 **Graph View** (Default)
- Shows branch structure with visual graph
- Best for understanding branch relationships
- **Current branch only by default** (fast!)

#### 📝 **Detailed View**
- Shows full commit messages with descriptions
- Good for reading commit details

#### 📋 **Complete View**
- Linear list of all commits (no graph)
- Excludes merge commits
- Shows only actual work

### 🌿 All Branches Option

By default, you'll see **only the current branch** (much faster!).

**To see all branches:**
1. Check the **"All Branches"** checkbox
2. Click **Refresh** or select repository again
3. View updates automatically

**When to use "All Branches":**
- ✅ Need to see commits from feature branches
- ✅ Checking work from other team members
- ✅ Understanding complete repository history

**When to keep it off (default):**
- ✅ Daily usage (much faster)
- ✅ Just checking recent work
- ✅ Repository has many branches (better performance)

### 🔄 Refreshing

Click the **"Refresh"** button to get the latest commits.
- Updates happen in real-time
- No caching - always fresh data
- Rate limited to 30 refreshes per minute

## 🔐 For Administrators

### Managing Repositories

1. **Login**: Use your admin credentials
2. **Navigate**: Go to `/repositories`
3. **Add Repository**:
   - Name: Display name for the repo
   - Git Log Path: Full path to the git repository
   - Description: Optional description

### Admin Login

See `ADMIN_CREDENTIALS.md` for login details.

### Performance Tips

- **Current branch mode** is 5-10x faster
- Encourage coworkers to use current branch view for daily use
- Use "All Branches" only when needed
- Monitor server load if many users access simultaneously

## 📊 Performance Features

- ⏱️ 10-second timeout protection
- 🛡️ Rate limiting (30 req/min)
- 🚀 Optimized git commands
- ⚡ Current branch default (fast!)
- 🌿 Optional all branches mode

## ❓ Troubleshooting

### "Request timed out"
- Repository might be very large
- Try "Complete View" (usually faster)
- Disable "All Branches" if enabled

### "Rate limit exceeded"
- Wait 60 seconds before refreshing
- Limit resets every minute

### "Repository path does not exist"
- Contact admin to verify repository configuration
- Path might be incorrect or repository moved

## 📚 More Information

- **Performance Details**: See `PERFORMANCE.md`
- **Admin Guide**: See `ADMIN_CREDENTIALS.md`
- **Full Documentation**: See `README.md`