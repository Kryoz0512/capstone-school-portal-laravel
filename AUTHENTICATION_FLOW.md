# Authentication Flow & Cookie-Based Protection

## Overview
The system now uses Laravel's session cookies to prevent logged-in users from accessing portal and login pages. Users must log out to access these pages again.

---

## Features Implemented

### 1. **Redirect Authenticated Users**
- If a user is already logged in and tries to access:
  - Portal page (`/`)
  - Student login (`/login/student`)
  - Teacher login (`/login/teacher`)
  - Adviser login (`/login/adviser`)
  - Admin login (`/admin-access-...`)
- They will be **automatically redirected** to their appropriate dashboard based on their role

### 2. **Role-Based Dashboard Redirection**
The system detects the user's role and redirects them to:
- **Students** → `/student/dashboard`
- **Teachers** → `/teacher/dashboard`
- **Admins** → `/admin/dashboard`

### 3. **Browser Back Button Protection**
- When a logged-in user clicks the browser's back button, they cannot go back to the portal or login pages
- They will be redirected to their dashboard instead
- This prevents accidental logouts or confusion

### 4. **URL Copy Protection**
- If someone copies the portal URL (`/`) or login URL and tries to visit it while logged in
- They will be automatically redirected to their dashboard
- The authentication cookie is checked on every request

---

## Technical Implementation

### Middleware: `RedirectIfAuthenticated`
**Location**: `app/Http/Middleware/RedirectIfAuthenticated.php`

This middleware:
1. Checks if the user is authenticated using Laravel's session cookies
2. Identifies the user's role from the database
3. Redirects to the appropriate dashboard based on role
4. Only allows access to portal/login pages if the user is NOT logged in (guest)

### Routes Protected
All portal and login routes now use the `guest` middleware:
```php
Route::get('/', ...)->middleware('guest')->name('home');
Route::get('/login/student', ...)->middleware('guest')->name('login.student');
Route::get('/login/teacher', ...)->middleware('guest')->name('login.teacher');
Route::get('/login/adviser', ...)->middleware('guest')->name('login.adviser');
Route::get('/admin-access-...', ...)->middleware('guest')->name('login.admin');
```

### Middleware Registration
**Location**: `bootstrap/app.php`

The middleware is registered as an alias `guest`:
```php
$middleware->alias([
    'guest' => RedirectIfAuthenticated::class,
]);
```

---

## User Experience Flow

### Scenario 1: User Tries to Access Portal While Logged In
1. User is logged in as a student
2. User navigates to `/` (portal page)
3. Middleware detects authentication cookie
4. User is redirected to `/student/dashboard`

### Scenario 2: User Clicks Browser Back Button
1. User is on the dashboard
2. User clicks browser back button
3. Browser tries to load previous page (portal/login)
4. Middleware intercepts and redirects to dashboard
5. User stays on the dashboard

### Scenario 3: User Copies Login URL
1. User is logged in as a teacher
2. User copies `/login/teacher` URL and pastes in new tab
3. Middleware detects authentication cookie
4. User is redirected to `/teacher/dashboard`

### Scenario 4: User Wants to Access Portal
1. User must log out first using the logout button
2. Session cookie is cleared
3. User can now access portal and login pages

---

## Security Benefits

1. **Prevents Session Confusion**: Users can't accidentally create multiple login sessions
2. **Protects User Privacy**: Logged-in users can't be tricked into re-entering credentials
3. **Better UX**: Users always see the correct page for their authentication state
4. **Cookie-Based**: Uses secure Laravel session cookies (encrypted by default)

---

## Testing the Feature

### Test 1: Portal Access While Logged In
1. Log in as any user
2. Try to visit `/`
3. You should be redirected to your dashboard

### Test 2: Browser Back Button
1. Log in and navigate to a few pages
2. Click browser back button repeatedly
3. You should never see the portal or login page

### Test 3: URL Copy
1. Log in as a student
2. Copy the URL `/login/teacher` and paste in browser
3. You should be redirected to `/student/dashboard`

### Test 4: Logout
1. Click logout button
2. You should see the portal page
3. You can now access login pages

---

## Cookie Information

Laravel uses the following cookies for authentication:
- **Session Cookie**: `laravel_session` (encrypted, HTTP-only)
- **XSRF Token**: `XSRF-TOKEN` (for CSRF protection)
- **Encrypted Cookie**: Contains user authentication state

These cookies are:
- **Secure**: Encrypted by Laravel
- **HTTP-Only**: Cannot be accessed via JavaScript (prevents XSS attacks)
- **Same-Site**: Protects against CSRF attacks
- **Expires**: When user logs out or after session timeout

---

## Important Notes

1. **Logout is Required**: Users MUST click logout to access portal/login pages
2. **No Manual Cookie Clearing**: Users shouldn't need to manually clear cookies
3. **Session Timeout**: Laravel's default session lifetime applies (usually 120 minutes)
4. **Remember Me**: If users check "Remember Me", the cookie persists longer

---

**Last Updated**: July 8, 2026
**System Version**: SNHS Portal v1.0
