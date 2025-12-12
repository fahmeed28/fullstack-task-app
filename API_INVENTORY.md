# Complete API Endpoint Inventory

## Base URL
`http://127.0.0.1:8000/api`

---

## PUBLIC ROUTES (No Authentication Required)

### Authentication
- **[PUBLIC]** `POST http://127.0.0.1:8000/api/register` → `AuthController@register`
  - Body: `{ name, email, password }`
  - Returns: `{ message, token, user }`

- **[PUBLIC]** `POST http://127.0.0.1:8000/api/login` → `AuthController@login`
  - Body: `{ email, password }`
  - Returns: `{ message, token, user }`
  - Status: 404 if user not found, 401 if invalid password

---

## PROTECTED ROUTES (auth:sanctum Required)

### Authentication
- **[PROTECTED: auth:sanctum]** `POST http://127.0.0.1:8000/api/logout` → `AuthController@logout`
  - Returns: `{ message: 'Logout successful' }`
  - ⚠️ **ISSUE FOUND**: Currently in PUBLIC routes, should be PROTECTED

### Categories
- **[PROTECTED: auth:sanctum]** `GET http://127.0.0.1:8000/api/categories` → `CategoryController@index`
  - Returns: Array of categories

- **[PROTECTED: auth:sanctum]** `POST http://127.0.0.1:8000/api/categories` → `CategoryController@store`
  - Body: `{ name }`
  - Returns: Created category object

### Tasks (apiResource)
- **[PROTECTED: auth:sanctum]** `GET http://127.0.0.1:8000/api/tasks` → `TaskController@index`
  - Returns: Array of tasks for current user only

- **[PROTECTED: auth:sanctum]** `POST http://127.0.0.1:8000/api/tasks` → `TaskController@store`
  - Body: `{ category_id, title, description?, status }`
  - Returns: Created task (201)

- **[PROTECTED: auth:sanctum]** `GET http://127.0.0.1:8000/api/tasks/{id}` → `TaskController@show`
  - Returns: Single task (only if owned by current user)
  - Status: 404 if not found or not owned

- **[PROTECTED: auth:sanctum]** `PUT http://127.0.0.1:8000/api/tasks/{id}` → `TaskController@update`
  - Body: `{ category_id, title, description?, status }`
  - Returns: `{ message, task }`
  - Status: 404 if not found or not owned

- **[PROTECTED: auth:sanctum]** `DELETE http://127.0.0.1:8000/api/tasks/{id}` → `TaskController@destroy`
  - Returns: `{ message }`
  - Status: 404 if not found or not owned

---

## ADMIN ROUTES (auth:sanctum + is_admin + /admin prefix)

### Admin Test
- **[ADMIN: auth:sanctum + is_admin + /admin prefix]** `GET http://127.0.0.1:8000/api/admin/test` → Closure
  - Returns: `{ message: 'Admin area working!' }`

### Admin Users
- **[ADMIN: auth:sanctum + is_admin + /admin prefix]** `GET http://127.0.0.1:8000/api/admin/users` → `AdminUserController@index`
  - Returns: Array of users with `{ id, name, email, is_admin }`

- **[ADMIN: auth:sanctum + is_admin + /admin prefix]** `POST http://127.0.0.1:8000/api/admin/users` → `AdminUserController@store`
  - Body: `{ name, email, password, is_admin }`
  - Returns: `{ message, user }` (201)
  - Creates new user/admin

- **[ADMIN: auth:sanctum + is_admin + /admin prefix]** `GET http://127.0.0.1:8000/api/admin/users/{id}` → `AdminUserController@show`
  - Returns: `{ user, tasks }` (user with tasks and categories)
  - Status: 404 if not found

- **[ADMIN: auth:sanctum + is_admin + /admin prefix]** `PUT http://127.0.0.1:8000/api/admin/users/{id}` → `AdminUserController@update`
  - Body: `{ name, email, is_admin }`
  - Returns: `{ message, user }`
  - Status: 404 if not found

- **[ADMIN: auth:sanctum + is_admin + /admin prefix]** `PUT http://127.0.0.1:8000/api/admin/users/{id}/admin` → `AdminUserController@setAdmin`
  - Body: `{ is_admin: true|false }`
  - Returns: `{ message, user }`
  - Status: 404 if not found, 403 if trying to change own role

- **[ADMIN: auth:sanctum + is_admin + /admin prefix]** `DELETE http://127.0.0.1:8000/api/admin/users/{id}` → `AdminUserController@destroy`
  - Returns: `{ message }`
  - Status: 404 if not found, 403 if trying to delete self

### Admin Tasks
- **[ADMIN: auth:sanctum + is_admin + /admin prefix]** `GET http://127.0.0.1:8000/api/admin/tasks` → `AdminTaskController@index`
  - Returns: Array of all tasks with user and category relationships

- **[ADMIN: auth:sanctum + is_admin + /admin prefix]** `GET http://127.0.0.1:8000/api/admin/tasks/{id}` → `AdminTaskController@show`
  - Returns: Single task with user and category
  - Status: 404 if not found

- **[ADMIN: auth:sanctum + is_admin + /admin prefix]** `PUT http://127.0.0.1:8000/api/admin/tasks/{id}` → `AdminTaskController@update`
  - Body: `{ title?, description?, status?, category_id? }`
  - Returns: `{ message, task }`
  - Status: 404 if not found, 422 if validation fails

- **[ADMIN: auth:sanctum + is_admin + /admin prefix]** `DELETE http://127.0.0.1:8000/api/admin/tasks/{id}` → `AdminTaskController@destroy`
  - Returns: `{ message }`
  - Status: 404 if not found

### Admin Dashboard
- **[ADMIN: auth:sanctum + is_admin + /admin prefix]** `GET http://127.0.0.1:8000/api/admin/dashboard-stats` → `AdminDashboardController@stats`
  - Returns: `{ total_users, total_tasks, completed_tasks, pending_tasks, new_users_today, new_tasks_today }`

---

## Summary

**Total Endpoints: 20**

- **PUBLIC**: 2 (register, login)
- **PROTECTED**: 7 (logout, 2 categories, 5 tasks)
- **ADMIN**: 11 (test, 6 users, 4 tasks, 1 dashboard)

---

## Issues Found

1. ⚠️ **CRITICAL**: `/api/logout` is currently in PUBLIC routes but should be PROTECTED (auth:sanctum)
2. ✅ All admin routes properly protected with both `auth:sanctum` and `is_admin` middleware
3. ✅ Admin cannot delete themselves (403 check in `AdminUserController@destroy`)
4. ✅ Admin cannot change own role (403 check in `AdminUserController@setAdmin`)

---

## Expected Status Codes

- **200**: Success
- **201**: Created
- **401**: Unauthenticated (missing/invalid token)
- **403**: Forbidden (not admin, or trying to delete/change self)
- **404**: Not Found
- **422**: Validation Error
