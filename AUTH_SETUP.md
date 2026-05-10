# TerduJournal - Authentication Setup Guide

## What's Been Set Up

Your project now has a complete authentication system with:

- **SQLite Database** for storing user data
- **Password Hashing** using bcryptjs for security
- **Session Management** using express-session
- **Login & Sign Up Pages** with form validation
- **Protected Routes** that require authentication
- **Logout functionality**

## Database

Database file: `terdujournal.db` (auto-created)

### Users Table Schema

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## API Endpoints

### 1. POST `/api/signup`

Create a new user account.

**Request:**

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Signup successful! Please login."
}
```

### 2. POST `/api/login`

Authenticate and create a session.

**Request:**

```json
{
  "username": "john_doe",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful!",
  "redirect": "/"
}
```

### 3. GET `/api/logout`

Destroy the user session and logout.

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 4. GET `/api/auth-status`

Check if user is currently authenticated.

**Response (Authenticated):**

```json
{
  "authenticated": true,
  "username": "john_doe"
}
```

**Response (Not Authenticated):**

```json
{
  "authenticated": false
}
```

## Pages

### 1. `/login.html`

Login page for existing users.

### 2. `/signup.html`

Sign up page for new users.

### 3. `/dashboard.html`

Protected dashboard page (requires authentication).

## Frontend Auth Helper

Include `js/auth.js` in your pages to get these utilities:

```html
<script src="js/auth.js"></script>
```

### Available Functions

```javascript
// Check authentication status
const status = await checkAuthStatus();
// Returns: { authenticated: true/false, username?: string }

// Logout user
logout();

// Auto-update navigation based on auth status
// (Requires an element with id="authNav")
updateNavigation();
```

## Security Notes

⚠️ **IMPORTANT:** Before deploying to production:

1. **Change the secret key** in `server.js`:

   ```javascript
   secret: "your-secret-key-change-this"; // Change this!
   ```

2. **Use HTTPS** in production:

   ```javascript
   cookie: {
     secure: true,  // Enable this for HTTPS
     httpOnly: true,
     maxAge: 1000 * 60 * 60 * 24
   }
   ```

3. **Add rate limiting** to prevent brute force attacks

4. **Validate input** on both client and server sides

5. **Never store sensitive data** in cookies

## Running the Server

```bash
# Install dependencies (if not already done)
npm install

# Start the server
node server.js

# Server runs on http://localhost:3000
```

## Testing the Auth System

1. Go to `http://localhost:3000/signup.html` to create an account
2. Go to `http://localhost:3000/login.html` to log in
3. Visit `http://localhost:3000/dashboard.html` (will redirect to login if not authenticated)
4. Use the logout button to end your session

## Next Steps

You can now:

- Add more protected routes using the `isAuthenticated` middleware
- Store additional user data in the database
- Create a user profile page
- Add article/journal functionality with user associations
- Implement password reset functionality
- Add email verification

## Example: Creating a Protected Route

```javascript
app.get("/api/user-data", isAuthenticated, function (req, res) {
  const user = db
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(req.session.userId);
  res.json(user);
});
```

Enjoy! 🚀
