# 🔧 COMPLETE SYSTEM RESET AND FIX

## Step 1: Stop All Servers

In VS Code terminal or PowerShell:
```powershell
taskkill /F /IM node.exe
```

Wait 5 seconds.

## Step 2: Reset Database

Run this script:
```bash
cd backend
node scripts/setup_teacher_tables.js
```

## Step 3: Start Backend

```bash
cd backend
npm start
```

Should show:
```
MySQL connected successfully.
✓ Server running on http://localhost:5001
```

## Step 4: Start Frontend (in NEW terminal)

```bash
cd frontend
npm run dev
```

Should show:
```
➜  Local:   http://localhost:5173/
```

## Step 5: Clear Browser Data

1. Open Chrome/Edge
2. Press `Ctrl + Shift + Delete`
3. Select:
   - ✅ Cookies and site data
   - ✅ Cached images and files
4. Click "Clear data"

## Step 6: Test

1. Go to: http://localhost:5173
2. Login: admin@school.com / password123
3. Go to Teachers page

## If Still Not Working

**Check this debug endpoint:**
```
http://localhost:5001/api/debug/counts
```

Should return:
```json
{
  "success": true,
  "counts": {
    "grades": 13,
    "subjects": 13,
    "sections": 39,
    "teachers": 2,
    "assignments": 1
  }
}
```

If this works but frontend doesn't, the issue is in the frontend.

**Check console logs:**
1. Press F12 in browser
2. Go to Console tab
3. Look for red errors
4. Take screenshot and share

## Common Fixes

### Fix 1: Port Already in Use
```bash
taskkill /F /IM node.exe
# Wait 5 seconds
cd backend
npm start
```

### Fix 2: Database Connection Failed
Check `backend/.env` has correct MySQL credentials:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Miki@1324
DB_NAME=student_management
```

### Fix 3: Frontend Can't Connect
Check `frontend/.env`:
```
VITE_API_URL=http://localhost:5001/api
```

### Fix 4: Token Expired
1. Logout
2. Clear browser storage (F12 > Application > Storage > Clear site data)
3. Login again

## Manual Database Setup

If automated script fails, run SQL manually:

```sql
USE student_management;

-- Check tables exist
SHOW TABLES;

-- Check data counts
SELECT COUNT(*) FROM grades;
SELECT COUNT(*) FROM subjects;
SELECT COUNT(*) FROM sections;
SELECT COUNT(*) FROM teachers;

-- If empty, run the schema.sql file
```
