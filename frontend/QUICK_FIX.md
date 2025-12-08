# Quick Fix: Network Error Resolution

## The Error
**"Network error: Could not connect to server"** comes from `src/services/api.js` when the frontend cannot reach the backend API.

## Step-by-Step Fix

### Step 1: Verify Backend is Running

Open a **NEW terminal window** and run:

```bash
cd ../backend
php artisan serve
```

You should see:
```
INFO  Server running on [http://127.0.0.1:8000]
```

**Keep this terminal open!** The backend must stay running.

### Step 2: Test Backend Connection

In your browser, open:
```
http://localhost:8000/api/login
```

You should see a JSON error (this is normal - it means the backend is working).

Or test with curl (if you have it):
```bash
curl http://localhost:8000/api/login -X POST -H "Content-Type: application/json" -d "{\"email\":\"test\",\"password\":\"test\"}"
```

### Step 3: Check Frontend is Using Correct URL

The frontend is configured to use: `http://localhost:8000/api`

If your backend is on a different port, create a `.env` file in the frontend directory:
```
VITE_API_URL=http://localhost:YOUR_PORT/api
```

Then restart the frontend dev server.

### Step 4: Verify Database is Set Up

Make sure you've run:
```bash
cd ../backend
php artisan migrate
php artisan db:seed
```

## Common Issues

### Issue 1: Backend Not Running
**Solution**: Run `php artisan serve` in the backend directory

### Issue 2: Port Already in Use
If you see "Address already in use":
```bash
# Use a different port
php artisan serve --port=8001
```
Then update frontend `.env`:
```
VITE_API_URL=http://localhost:8001/api
```

### Issue 3: CORS Error in Browser Console
Laravel 11 handles CORS automatically, but if you see CORS errors:
1. Make sure backend is running
2. Check browser console for specific CORS error message
3. Verify you're accessing frontend from `http://localhost:5173` (Vite default)

### Issue 4: Firewall/Antivirus Blocking
- Temporarily disable firewall/antivirus
- Or add exception for localhost:8000

## Verify Everything Works

1. Backend running: `http://localhost:8000` should show Laravel welcome page
2. API accessible: `http://localhost:8000/api/login` should return JSON
3. Frontend can connect: Try login with `admin@admin.com` / `admin123`

## Still Not Working?

Check browser console (F12) for:
- Exact error message
- Network tab shows failed requests
- CORS errors
- 404/500 errors

Share the exact error message from browser console for more help!

