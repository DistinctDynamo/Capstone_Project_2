# Sign-In Page

## Page Overview

| Property | Value |
|----------|-------|
| Page Name | Sign-In |
| URL Path | `/sign-in` |
| Purpose | Authenticate existing users to access the Soccer Connect platform |
| Access Level | Public (unauthenticated users) |

## Page Description

The Sign-In page allows registered users of Soccer Connect to authenticate and access their accounts. The page provides a simple, clean interface for entering login credentials with options for password recovery and navigation back to the previous page.

---

## Header Section

### Logo and Branding

| Element | Description |
|---------|-------------|
| Logo | Soccer ball icon (black and white) positioned in the top-left corner |
| Application Name | "Soccer Connect" - displayed as the main heading |
| Tagline | "A Place to connect and play in the GTA" |

---

## Main Content - Login Form

### Form Fields

#### Username Field

| Property | Specification |
|----------|---------------|
| Label | "Username:" |
| Input Type | Text |
| Placeholder | None visible |
| Required | Yes |
| Validation Rules | - Must not be empty |
| | - Minimum length: 3 characters |
| | - Maximum length: 50 characters |
| | - Alphanumeric characters allowed |
| Error Messages | "Username is required" |
| | "Username must be at least 3 characters" |

#### Password Field

| Property | Specification |
|----------|---------------|
| Label | "Password:" |
| Input Type | Password (masked with asterisks/dots) |
| Placeholder | None visible |
| Required | Yes |
| Validation Rules | - Must not be empty |
| | - Minimum length: 8 characters |
| Error Messages | "Password is required" |
| | "Invalid username or password" (generic for security) |

---

## Interactive Elements

### Buttons

#### Sign-In Button

| Property | Specification |
|----------|---------------|
| Label | "Sign-In" |
| Style | Primary button - Cyan/Teal background (#00BCD4) with white text |
| Shape | Rounded rectangle |
| Position | Left of center, below form fields |
| Action | Submit login form and authenticate user |
| Behavior | - Validate all form fields |
| | - Display loading state during authentication |
| | - On success: Redirect to dashboard/home |
| | - On failure: Display error message |

#### Back Button

| Property | Specification |
|----------|---------------|
| Label | "Back" |
| Style | Secondary button - Yellow/Gold background (#FFC107) with dark text |
| Shape | Rounded rectangle |
| Position | Right of Sign-In button |
| Action | Navigate to previous page (typically landing page) |

### Links

#### Forgot Password Link

| Property | Specification |
|----------|---------------|
| Label | "Forgot Password?" |
| Style | Cyan/Teal text link (#00BCD4) |
| Position | Centered, between form fields and buttons |
| Action | Navigate to password recovery page |

---

## Footer Section

### Social Media Links

| Platform | Icon | Action |
|----------|------|--------|
| Twitter | Twitter bird icon | Opens Twitter profile in new tab |
| Instagram | Instagram camera icon | Opens Instagram profile in new tab |

### Footer Navigation - About Us Column

| Link Text | Destination |
|-----------|-------------|
| About Us | (Section Header) |
| Mission Statement | `/about/mission` |
| News | `/news` |
| Careers | `/careers` |

### Footer Navigation - Contact Us Column

| Link Text | Destination |
|-----------|-------------|
| Contact Us | (Section Header) |
| Account Help | `/help/account` |
| Contact Form | `/contact` |
| Business Opportunities | `/business` |

---

## API Endpoints

### Required Endpoints

#### POST /api/auth/login

Authenticates user credentials and returns session token.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "jwt_token_string",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid username or password"
}
```

#### POST /api/auth/forgot-password

Initiates password recovery process.

**Request Body:**
```json
{
  "email": "string"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

#### GET /api/auth/validate-session

Validates current session token.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "valid": true,
  "user": {
    "id": "string",
    "username": "string"
  }
}
```

---

## Data Requirements

### User Authentication Data

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| username | String | Yes | User's unique username |
| password | String | Yes | User's password (transmitted securely) |

### Session Data (Response)

| Field | Type | Description |
|-------|------|-------------|
| token | String | JWT authentication token |
| userId | String | Unique user identifier |
| username | String | User's display name |
| expiresAt | DateTime | Token expiration timestamp |

---

## User Flow

1. User arrives at Sign-In page
2. User enters username in the username field
3. User enters password in the password field
4. User clicks "Sign-In" button
5. System validates credentials
   - **Success**: User is redirected to dashboard/home page
   - **Failure**: Error message is displayed, form remains on page
6. Alternative flows:
   - User clicks "Forgot Password?" to recover account
   - User clicks "Back" to return to previous page

---

## Security Considerations

- Password field must mask input
- Implement rate limiting on login attempts (e.g., 5 attempts per 15 minutes)
- Use HTTPS for all authentication requests
- Store passwords using secure hashing (bcrypt)
- Implement CSRF protection on form submission
- Generic error messages to prevent username enumeration
- Session tokens should have appropriate expiration times

---

## Accessibility Requirements

- All form fields must have associated labels
- Tab navigation should follow logical order (Username -> Password -> Forgot Password -> Sign-In -> Back)
- Error messages must be announced to screen readers
- Color contrast must meet WCAG 2.1 AA standards
- Focus states must be visible on all interactive elements

---

## Responsive Design Notes

- Form should be centered on all screen sizes
- Buttons should stack vertically on mobile devices
- Footer columns should stack on smaller screens
- Minimum touch target size of 44x44 pixels for mobile
