# Account Creation Page

## Page Overview

| Property | Value |
|----------|-------|
| Page Name | Create An Account |
| Purpose | Allow new users to register for a Soccer Connect account |
| URL Path | `/register` or `/create-account` |
| Access Level | Public (unauthenticated users) |

---

## Page Description

The Account Creation page enables new users to register for the Soccer Connect platform. Users can create either a Player or other account type to connect and play soccer in the GTA (Greater Toronto Area). The page features a clean, minimalist design with the Soccer Connect branding and a straightforward registration form.

---

## UI Components

### Header Section

| Component | Description |
|-----------|-------------|
| Logo | Soccer ball icon (top-left corner) |
| Brand Name | "Soccer Connect" in bold black text |
| Tagline | "A Place to connect and play in the GTA" |

### Main Content Area

#### Page Title
- **Text**: "Create An Account"
- **Position**: Centered above the form
- **Style**: Medium-weight heading

#### Registration Form

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| First Name | Text Input | Yes | User's first name |
| Last Name | Text Input | Yes | User's last name |
| Email | Email Input | Yes | User's email address |
| Username | Text Input | Yes | Unique username for the account |
| Account Type | Dropdown Select | Yes | Type of account (default: "Player") |
| Password | Password Input | Yes | Account password |
| Confirm Password | Password Input | Yes | Password confirmation |

---

## Form Fields Detailed Specifications

### First Name
- **Label**: "First Name:"
- **Type**: Text
- **Validation**:
  - Required field
  - Minimum 2 characters
  - Maximum 50 characters
  - Alphabetic characters only (with spaces and hyphens allowed)

### Last Name
- **Label**: "Last Name:"
- **Type**: Text
- **Validation**:
  - Required field
  - Minimum 2 characters
  - Maximum 50 characters
  - Alphabetic characters only (with spaces and hyphens allowed)

### Email
- **Label**: "Email:"
- **Type**: Email
- **Validation**:
  - Required field
  - Valid email format (example@domain.com)
  - Must be unique in the system
  - Maximum 255 characters

### Username
- **Label**: "Username:"
- **Type**: Text
- **Validation**:
  - Required field
  - Minimum 3 characters
  - Maximum 30 characters
  - Alphanumeric characters, underscores, and hyphens only
  - Must be unique in the system
  - No spaces allowed

### Account Type
- **Label**: "Account Type:"
- **Type**: Dropdown Select
- **Default Value**: "Player"
- **Options** (suggested):
  - Player
  - Team Manager
  - Coach
  - League Organizer
- **Validation**:
  - Required field
  - Must select a valid option

### Password
- **Label**: "Password:"
- **Type**: Password (masked input)
- **Validation**:
  - Required field
  - Minimum 8 characters
  - Must contain at least one uppercase letter
  - Must contain at least one lowercase letter
  - Must contain at least one number
  - Must contain at least one special character
  - Maximum 128 characters

### Confirm Password
- **Label**: "Confirm Password:"
- **Type**: Password (masked input)
- **Validation**:
  - Required field
  - Must exactly match the Password field

---

## Buttons and Actions

| Button | Style | Action |
|--------|-------|--------|
| Create Account | Yellow/Gold background with black text, rounded corners | Submit the registration form |
| Back | Light blue/cyan background with dark text, rounded corners | Navigate back to previous page (likely Login page) |

### Create Account Button
- **Label**: "Create Account"
- **Style**: Primary action button (yellow/gold)
- **Position**: Left of the Back button
- **On Click Actions**:
  1. Validate all form fields
  2. Display validation errors if any fields are invalid
  3. If valid, submit data to the registration API endpoint
  4. Show loading indicator during submission
  5. On success: Redirect to login page or dashboard with success message
  6. On failure: Display appropriate error message

### Back Button
- **Label**: "Back"
- **Style**: Secondary action button (cyan/light blue)
- **Position**: Right of the Create Account button
- **On Click Actions**:
  1. Navigate to the previous page (Login page)
  2. Optionally show confirmation if form has unsaved data

---

## Navigation Elements

### Header Navigation
- Logo (clickable - returns to home page)

### Footer Navigation

#### Social Media Links (Left side)
| Icon | Platform | Action |
|------|----------|--------|
| Twitter/X Icon | Twitter | Opens Soccer Connect Twitter page in new tab |
| Instagram Icon | Instagram | Opens Soccer Connect Instagram page in new tab |

#### About Us Section (Center-left)
| Link | Destination |
|------|-------------|
| Mission Statement | `/about/mission` |
| News | `/news` |
| Careers | `/careers` |

#### Contact Us Section (Center-right)
| Link | Destination |
|------|-------------|
| Account Help | `/help/account` |
| Contact Form | `/contact` |
| Business Opportunities | `/business` |

---

## Footer Content

The footer is displayed on a gray background and contains:

1. **Social Media Icons** (left side):
   - Twitter (X) icon
   - Instagram icon

2. **About Us Column**:
   - Mission Statement
   - News
   - Careers

3. **Contact Us Column**:
   - Account Help
   - Contact Form
   - Business Opportunities

---

## Suggested API Endpoints

### Primary Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create a new user account |
| GET | `/api/auth/check-username/{username}` | Check if username is available |
| GET | `/api/auth/check-email/{email}` | Check if email is available |
| GET | `/api/account-types` | Get list of available account types |

### API Request/Response Specifications

#### POST /api/auth/register

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "username": "string",
  "accountType": "string",
  "password": "string",
  "confirmPassword": "string"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "userId": "string",
    "username": "string",
    "email": "string",
    "accountType": "string"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email already exists"
    }
  ]
}
```

#### GET /api/auth/check-username/{username}

**Success Response (200 OK):**
```json
{
  "available": true,
  "username": "string"
}
```

#### GET /api/auth/check-email/{email}

**Success Response (200 OK):**
```json
{
  "available": true,
  "email": "string"
}
```

#### GET /api/account-types

**Success Response (200 OK):**
```json
{
  "accountTypes": [
    {
      "id": "player",
      "name": "Player",
      "description": "Individual soccer player"
    },
    {
      "id": "team_manager",
      "name": "Team Manager",
      "description": "Manager of a soccer team"
    },
    {
      "id": "coach",
      "name": "Coach",
      "description": "Team coach"
    },
    {
      "id": "league_organizer",
      "name": "League Organizer",
      "description": "Organizer of soccer leagues"
    }
  ]
}
```

---

## Data Requirements

### User Registration Data Model

| Field | Type | Constraints | Database Column |
|-------|------|-------------|-----------------|
| id | UUID | Primary Key, Auto-generated | id |
| first_name | String | NOT NULL, Max 50 chars | first_name |
| last_name | String | NOT NULL, Max 50 chars | last_name |
| email | String | NOT NULL, UNIQUE, Max 255 chars | email |
| username | String | NOT NULL, UNIQUE, Max 30 chars | username |
| account_type | Enum/String | NOT NULL, Foreign Key or Enum | account_type |
| password_hash | String | NOT NULL, Hashed | password_hash |
| created_at | Timestamp | Auto-generated | created_at |
| updated_at | Timestamp | Auto-generated, Auto-updated | updated_at |
| email_verified | Boolean | Default: false | email_verified |
| is_active | Boolean | Default: true | is_active |

### Account Types Reference Data

| ID | Name | Description |
|----|------|-------------|
| player | Player | Individual soccer player looking to join games/teams |
| team_manager | Team Manager | Person managing a soccer team |
| coach | Coach | Team coach or trainer |
| league_organizer | League Organizer | Person organizing soccer leagues and tournaments |

---

## Security Considerations

1. **Password Security**:
   - Passwords must be hashed using bcrypt or similar algorithm
   - Never store plain text passwords
   - Implement rate limiting on registration attempts

2. **Input Validation**:
   - Sanitize all inputs to prevent XSS attacks
   - Use parameterized queries to prevent SQL injection
   - Validate email format on both client and server side

3. **Email Verification**:
   - Send verification email upon registration
   - Account should have limited access until email is verified

4. **CAPTCHA**:
   - Consider implementing reCAPTCHA to prevent bot registrations

---

## Accessibility Requirements

1. All form fields must have associated labels
2. Error messages must be announced to screen readers
3. Form must be fully navigable via keyboard
4. Color contrast must meet WCAG 2.1 AA standards
5. Focus indicators must be visible on all interactive elements

---

## Responsive Design Notes

- Form should stack vertically on mobile devices
- Buttons should be full-width on mobile
- Footer should reorganize to single-column layout on smaller screens
- Minimum touch target size of 44x44 pixels for mobile
