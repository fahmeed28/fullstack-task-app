# Troubleshooting Guide

## Registration/Login Issues

### Common Problems and Solutions:

1. **CORS Errors**
   - Make sure your Laravel backend is running
   - Laravel 11 handles CORS automatically, but ensure your `.env` file has proper settings
   - Check that the frontend URL is allowed in Laravel's CORS configuration

2. **Network Errors**
   - Verify the backend is running on `http://localhost:8000`
   - Check the browser console for detailed error messages
   - Ensure the API URL in the frontend matches your backend URL

3. **Validation Errors**
   - Email must be unique (not already registered)
   - Password must be at least 6 characters
   - All fields are required

4. **Backend Not Running**
   - Navigate to the backend directory
   - Run `php artisan serve` to start the Laravel server
   - Default port is 8000

## Creating Superuser

Run the following commands in the backend directory:

```bash
cd ../backend
php artisan migrate
php artisan db:seed
```

This will create:
- **Superuser**: admin@admin.com / admin123
- **Test User**: test@example.com / password123

## Testing the API

You can test the API endpoints directly using curl or Postman:

### Register:
```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"password123"}'
```

### Login:
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"admin@admin.com","password":"admin123"}'
```

## Browser Console

Check the browser console (F12) for:
- Network errors
- CORS errors
- API response errors
- Console logs showing the API base URL

