# Setup Instructions

## Quick Fix for Registration/Login Issues

### Step 1: Start the Backend Server

```bash
cd ../backend
php artisan serve
```

The backend should now be running on `http://localhost:8000`

### Step 2: Run Migrations and Seed Database

```bash
# Make sure you're in the backend directory
cd ../backend

# Run migrations
php artisan migrate

# Seed the database (creates superuser)
php artisan db:seed
```

### Step 3: Start the Frontend

```bash
# Make sure you're in the frontend directory
cd frontend
npm run dev
```

## Superuser Credentials

After running `php artisan db:seed`, you can login with:

- **Email**: `admin@admin.com`
- **Password**: `admin123`

## Test User Credentials

- **Email**: `test@example.com`
- **Password**: `password123`

## Common Issues

### Issue: "Network error: Could not connect to server"
**Solution**: Make sure the Laravel backend is running (`php artisan serve`)

### Issue: "CORS error" in browser console
**Solution**: 
1. Check that backend is running
2. Laravel 11 handles CORS automatically, but ensure your backend `.env` has:
   ```
   APP_URL=http://localhost:8000
   ```

### Issue: "User not found" or "Invalid credentials"
**Solution**: Run `php artisan db:seed` to create the superuser

### Issue: Registration fails with validation errors
**Solution**: 
- Email must be unique (not already registered)
- Password must be at least 6 characters
- All fields are required

## Verify Backend is Working

Test the API directly:

```bash
curl http://localhost:8000/api/login -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"admin@admin.com","password":"admin123"}'
```

You should get a response with a token.

