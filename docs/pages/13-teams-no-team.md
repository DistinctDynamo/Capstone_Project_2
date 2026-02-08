# Teams Homepage (User Has No Team)

## Page Overview

| Property | Value |
|----------|-------|
| **Page Name** | Teams Homepage (No Team State) |
| **Route** | `/teams` or `/team` |
| **Purpose** | Display options for users who are not currently members of any team, allowing them to either create a new team or search for an existing team to join |
| **User State** | Authenticated user with no team membership |

---

## Page Purpose

This page serves as the entry point for users who want to participate in team activities but have not yet joined or created a team. It provides a clear, simple interface with two primary call-to-action options:

1. **Create Team** - For users who want to start their own team
2. **Find Team** - For users who want to browse and join existing teams

---

## UI Components

### Header Section

#### Logo and Branding
- **Soccer ball icon** - Application logo positioned in the top-left corner
- **Application name** - "Soccer Connect" displayed in bold, stylized font
- **Tagline** - "A Place to connect and play in the GTA" displayed below the application name

#### Header Navigation Buttons (Top Right)
| Button | Style | Action |
|--------|-------|--------|
| Account | Cyan/turquoise button with rounded corners, outlined style | Navigate to user account settings page |
| Log Out | Cyan/turquoise button with rounded corners, filled style | Log out the current user and redirect to login page |

### Main Navigation Bar

Horizontal navigation bar with three primary feature buttons:

| Button | Style | Action |
|--------|-------|--------|
| Book a Field | Cyan/turquoise button with rounded corners | Navigate to field booking page |
| Classifieds | Cyan/turquoise button with rounded corners | Navigate to classifieds/marketplace page |
| Events | Cyan/turquoise button with rounded corners | Navigate to events listing page |

### Main Content Area

#### Page Title
- **"Team"** - Large section heading indicating the current page context

#### Primary Action Buttons

Two large, prominent call-to-action buttons stacked vertically:

| Button | Style | Dimensions | Action |
|--------|-------|------------|--------|
| Create Team | Large cyan/turquoise rectangle with rounded corners, bold black text | Full-width, approximately 200px height | Navigate to team creation form/wizard |
| Find Team | Large cyan/turquoise rectangle with rounded corners, bold black text | Full-width, approximately 200px height | Navigate to team search/browse page |

### Footer Section

#### Social Media Links (Left Side)
- **Twitter/X icon** - Link to Soccer Connect Twitter profile
- **Instagram icon** - Link to Soccer Connect Instagram profile

#### Footer Navigation Links

Organized in two columns:

**Column 1 - About Us**
| Link | Destination |
|------|-------------|
| About Us | Company information page |
| Mission Statement | Organization mission and values page |
| News | News and announcements page |
| Careers | Job opportunities page |

**Column 2 - Contact Us**
| Link | Destination |
|------|-------------|
| Contact Us | Contact information page |
| Account Help | Help documentation for account issues |
| Contact Form | Contact submission form |
| Business Opportunities | Partnership and business inquiry page |

---

## Color Scheme

| Element | Color |
|---------|-------|
| Primary buttons | Cyan/Turquoise (#00CED1 or similar) |
| Button text | Black |
| Page background | White |
| Footer background | Gray |
| Footer text | Black |
| Logo | Black |

---

## User Flow Description

### Entry Points
1. User clicks "Team" or "Teams" from main navigation
2. User is redirected to this page after leaving a team
3. User is redirected here after account creation if no team is assigned

### Flow Diagram

```
[User arrives at Teams page]
        |
        v
[System checks team membership]
        |
        v
[No team found] --> [Display this page]
        |
        +---> [User clicks "Create Team"]
        |           |
        |           v
        |     [Navigate to Team Creation Form]
        |           |
        |           v
        |     [User creates team] --> [Redirect to Team Dashboard]
        |
        +---> [User clicks "Find Team"]
                    |
                    v
              [Navigate to Team Search Page]
                    |
                    v
              [User browses/searches teams]
                    |
                    v
              [User requests to join team]
                    |
                    v
              [Pending approval or instant join]
```

### Expected Behaviors

1. **Create Team Button**
   - On click: Navigate to `/teams/create` or `/team/create`
   - Opens team creation form with fields for team name, description, logo, etc.

2. **Find Team Button**
   - On click: Navigate to `/teams/search` or `/teams/browse`
   - Opens team search page with filters and team listings

---

## Suggested API Endpoints

### Required for This Page

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/{userId}/team` | Check if user has a team membership (returns 404 or null if no team) |
| GET | `/api/users/me/team-status` | Get current user's team membership status |

### Related Endpoints (for navigation targets)

#### Team Creation
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/teams` | Create a new team |
| GET | `/api/teams/check-name/{name}` | Check if team name is available |

#### Team Search/Browse
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/teams` | List all teams (with pagination) |
| GET | `/api/teams/search?q={query}` | Search teams by name or description |
| GET | `/api/teams/{teamId}` | Get team details |
| POST | `/api/teams/{teamId}/join-requests` | Request to join a team |

#### User Authentication (Header)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user profile |
| POST | `/api/auth/logout` | Log out current user |

---

## Responsive Design Considerations

- Main action buttons should stack vertically on all screen sizes
- Navigation bar may collapse to hamburger menu on mobile
- Footer links may stack in single column on smaller screens
- Social media icons should remain visible on all screen sizes

---

## Accessibility Requirements

- All buttons must have appropriate `aria-label` attributes
- Color contrast should meet WCAG AA standards
- Keyboard navigation must be fully supported
- Focus states must be clearly visible on all interactive elements

---

## Related Pages

| Page | Relationship |
|------|--------------|
| Team Creation Form | Destination from "Create Team" button |
| Team Search/Browse | Destination from "Find Team" button |
| Team Dashboard | Displayed when user has a team |
| Account Settings | Destination from "Account" button |
| Login Page | Destination after logout |
