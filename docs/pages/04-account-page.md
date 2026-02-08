# Account Page

## Page Overview

**Page Name:** Account Page
**Purpose:** Allow authenticated users to view and manage their personal profile information and soccer statistics. This page serves as the central hub for user account management within the Soccer Connect application.

---

## UI Components

### Header Section

| Component | Description |
|-----------|-------------|
| Logo | Soccer ball icon positioned in the top-left corner |
| App Title | "Soccer Connect" with tagline "A Place to connect and play in the GTA" |
| Log Out Button | Cyan/turquoise button in the top-right corner |

---

### Profile Section

A card/container with a light gray background containing user profile information.

#### Profile Image Area

| Component | Description |
|-----------|-------------|
| Profile Image | Circular avatar placeholder (displays default image icon when no photo uploaded) |
| Change Image Link | Text link below the avatar to upload/change profile picture |

#### Profile Form Fields

| Field | Type | Required | Validation Rules |
|-------|------|----------|------------------|
| First Name | Text Input | Yes | - Minimum 2 characters<br>- Maximum 50 characters<br>- Letters only |
| Last Name | Text Input | Yes | - Minimum 2 characters<br>- Maximum 50 characters<br>- Letters only |
| Email | Email Input | Yes | - Valid email format<br>- Unique in system |
| Password | Password Input | No | - Minimum 8 characters<br>- Must contain uppercase, lowercase, number<br>- Only required when changing password |
| Confirm Password | Password Input | No | - Must match Password field<br>- Required if Password is filled |

#### Profile Actions

| Button | Style | Action |
|--------|-------|--------|
| Edit | Cyan/turquoise filled button | Enables edit mode for profile fields and saves changes |

---

### Statistics Section

A separate card/container displaying the user's soccer statistics.

#### Stats Fields

| Stat Field | Type | Description |
|------------|------|-------------|
| Goals Scored | Numeric Display/Input | Total number of goals scored by the player |
| Goals Defended | Numeric Display/Input | Total number of goals defended (for goalkeepers/defenders) |
| Games Played | Numeric Display/Input | Total number of games participated in |
| Positions Played | Text/Dropdown | Positions the player has played (e.g., Forward, Midfielder, Defender, Goalkeeper) |
| Teams Played On | Numeric Display/Input | Number of teams the player has been part of |

#### Stats Actions

| Button | Style | Action |
|--------|-------|--------|
| Update | Cyan/turquoise filled button | Saves changes to statistics |

---

### Quick Navigation Section

A row of navigation buttons below the main content.

| Button | Style | Destination |
|--------|-------|-------------|
| Team | Cyan/turquoise outlined button | Navigate to Team page |
| Book a Field | Cyan/turquoise filled button | Navigate to Field Booking page |
| Classifieds | Cyan/turquoise filled button | Navigate to Classifieds/Marketplace page |
| Events | Cyan/turquoise outlined button | Navigate to Events page |

---

### Footer Section

#### Social Media Icons

| Icon | Platform | Action |
|------|----------|--------|
| Twitter/X Icon | Twitter | Links to Soccer Connect Twitter profile |
| Instagram Icon | Instagram | Links to Soccer Connect Instagram profile |

#### Footer Links

| Column 1 | Column 2 |
|----------|----------|
| About Us | Contact Us |
| Mission Statement | Account Help |
| News | Contact Form |
| Careers | Business Opportunities |

---

## Suggested API Endpoints

### User Profile Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/:id` | Retrieve user profile information |
| PUT | `/api/users/:id` | Update user profile information |
| PUT | `/api/users/:id/password` | Update user password |
| POST | `/api/users/:id/avatar` | Upload/update profile image |
| DELETE | `/api/users/:id/avatar` | Remove profile image |

### User Statistics Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/:id/stats` | Retrieve user statistics |
| PUT | `/api/users/:id/stats` | Update user statistics |

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/logout` | Log out the current user |

---

## Data Requirements

### User Profile Data Model

```javascript
{
  id: String,           // Unique user identifier
  firstName: String,    // User's first name
  lastName: String,     // User's last name
  email: String,        // User's email address (unique)
  password: String,     // Hashed password (never returned in responses)
  avatarUrl: String,    // URL to profile image (optional)
  createdAt: Date,      // Account creation timestamp
  updatedAt: Date       // Last profile update timestamp
}
```

### User Statistics Data Model

```javascript
{
  userId: String,           // Reference to user
  goalsScored: Number,      // Total goals scored
  goalsDefended: Number,    // Total goals defended
  gamesPlayed: Number,      // Total games played
  positionsPlayed: [String], // Array of positions played
  teamsPlayedOn: Number,    // Number of teams played on
  updatedAt: Date           // Last stats update timestamp
}
```

---

## State Management

### Page States

| State | Description |
|-------|-------------|
| View Mode | Default state - fields display current values as read-only |
| Edit Mode | Activated by Edit button - fields become editable |
| Loading | Display spinner/skeleton while fetching or saving data |
| Error | Display error messages for failed operations |
| Success | Display success notification after successful updates |

### Form Validation States

| State | Visual Indicator |
|-------|------------------|
| Valid | Green border/checkmark |
| Invalid | Red border with error message below field |
| Pristine | Default styling (unchanged from initial load) |

---

## Accessibility Requirements

- All form fields must have associated labels
- Error messages must be announced to screen readers
- Buttons must have clear focus states
- Color contrast must meet WCAG 2.1 AA standards
- Images must have appropriate alt text

---

## Security Considerations

- Password fields must mask input
- Current password should be required when changing password
- Session validation before displaying page
- CSRF protection on all form submissions
- Rate limiting on password change attempts
