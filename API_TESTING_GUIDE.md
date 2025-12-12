# API Testing Guide

## Overview

This project includes a comprehensive API Test Panel that allows you to test all endpoints through the React UI without using Postman.

## Accessing the Test Panel

1. **Development Mode Only**: The test panel is only available in development mode
2. **URL**: Navigate to `http://localhost:5173/api-test` (or your frontend URL + `/api-test`)
3. **No Authentication Required**: The test panel itself doesn't require authentication, but individual tests may need tokens

## Test Panel Features

### Test Categories

#### 🌐 Public Routes
- **Test Register (unique email)**: Creates a new user account
- **Test Register duplicate email (expect 422)**: Tests validation for duplicate emails
- **Test Login valid**: Tests successful login
- **Test Login invalid password (expect 401)**: Tests authentication failure

#### 🔒 Protected Routes
- **Test Logout without token (expect 401)**: Verifies logout requires authentication
- **Test Logout with token (expect 200)**: Tests successful logout
- **Test Tasks list without token (expect 401)**: Verifies tasks require authentication
- **Test Tasks list with token**: Tests fetching user's tasks
- **Test Create Task**: Creates a new task (requires login)
- **Test Update Task**: Updates an existing task
- **Test Delete Task**: Deletes a task
- **Test Task Not Found (expect 404)**: Tests 404 handling

#### 👑 Admin Routes
- **Test Admin endpoints with normal token (expect 403)**: Verifies admin routes reject non-admin users
- **Test Admin endpoints with admin token (expect 200)**: Tests admin access
- **Test Admin Create User**: Creates a new user as admin
- **Test Admin Set Admin Role**: Changes a user's admin status
- **Test Admin Delete Self (expect 403)**: Verifies admin cannot delete themselves
- **Test Admin Get Dashboard Stats**: Tests dashboard statistics endpoint
- **Test User Not Found (expect 404)**: Tests 404 handling for users

## How to Use

### Step 1: Start Backend
```bash
cd backend
php artisan serve
```

### Step 2: Start Frontend
```bash
cd frontend
npm run dev
```

### Step 3: Access Test Panel
Navigate to `http://localhost:5173/api-test`

### Step 4: Run Tests
1. Click any test button to run that specific test
2. Results appear in the right panel
3. Green = Pass, Red = Fail
4. Each result shows:
   - Test name
   - Status code
   - Expected vs Actual status
   - Response data or error details

### Test Flow Recommendations

1. **Start with Public Routes**:
   - Run "Test Register" to create a test user
   - Run "Test Login valid" to get a token
   - Run "Test Register duplicate email" to test validation

2. **Then Test Protected Routes**:
   - Run "Test Tasks list without token" (should fail with 401)
   - Run "Test Tasks list with token" (should succeed)
   - Create, update, and delete tasks

3. **Finally Test Admin Routes**:
   - Login as admin user (use existing admin account)
   - Run "Test Admin endpoints with normal token" (should fail with 403)
   - Run "Test Admin endpoints with admin token" (should succeed)
   - Test admin user management

## Understanding Test Results

### Pass Criteria
- **Success Tests**: Status code 200-299
- **Expected Error Tests**: Status code matches expected (e.g., 401, 403, 404, 422)

### Result Display
- **Green Border**: Test passed
- **Red Border**: Test failed
- **Status Badge**: Shows PASS or FAIL
- **Status Code**: HTTP response code
- **Expected vs Actual**: Shows if status matches expectation

### Error Details
- Click "Error Details" to see full error response
- Click "Response Data" to see successful response data

## Token Management

The test panel automatically:
- Saves tokens from successful login/register
- Uses tokens for authenticated requests
- Stores admin token separately from user token
- Loads tokens from localStorage on page load

## Troubleshooting

### "Network error" Messages
- Ensure backend is running on `http://127.0.0.1:8000`
- Check CORS configuration
- Verify API_BASE_URL in frontend

### "Please login first" Errors
- Run login/register tests first
- Check that tokens are being saved
- Verify localStorage has 'token' and 'user' items

### Tests Failing Unexpectedly
- Check backend logs for errors
- Verify database is set up correctly
- Ensure all migrations are run
- Check that test data exists (categories, etc.)

## Test Coverage

The test panel covers:
- ✅ All public endpoints
- ✅ All protected endpoints
- ✅ All admin endpoints
- ✅ Authentication flows
- ✅ Authorization checks (403)
- ✅ Not found scenarios (404)
- ✅ Validation errors (422)
- ✅ Unauthorized access (401)
- ✅ CRUD operations
- ✅ Edge cases (delete self, etc.)

## Notes

- Tests are independent but some require previous tests (e.g., create task requires login)
- The panel remembers created IDs (user ID, task ID) for follow-up tests
- All tests use the centralized API client with proper error handling
- Results are displayed in reverse chronological order (newest first)
