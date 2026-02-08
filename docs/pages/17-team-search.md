# Team Search Page

## Page Overview

**Page Name:** Team Search
**Route:** `/teams/search` or `/team-search`
**Purpose:** Allow users to browse and discover available soccer teams in the GTA area and apply to join them.

---

## Page Layout

### Header Section

#### Logo Area
- **Soccer Connect Logo:** Soccer ball icon positioned in the top-left corner
- **Brand Name:** "Soccer Connect" displayed prominently below the logo
- **Tagline:** "A Place to connect and play in the GTA"

#### User Actions (Top Right)
| Button | Style | Action |
|--------|-------|--------|
| Account | Cyan/Turquoise button with rounded corners | Navigate to user account/profile page |
| Log Out | Cyan/Turquoise button with rounded corners | Log out current user and redirect to login/home |

---

### Navigation Bar

Horizontal navigation menu with four main options:

| Nav Item | Style | Destination |
|----------|-------|-------------|
| Team | Cyan button with dark border | Navigate to team-related pages (current section) |
| Book a Field | Cyan button with dark border | Navigate to field booking page |
| Classifieds | Cyan button with dark border | Navigate to classifieds/marketplace |
| Events | Cyan button with dark border | Navigate to events listing page |

---

### Main Content Area

#### Page Title
- **Title:** "Team Search"
- **Style:** Large, bold black text
- **Position:** Left-aligned below navigation

#### Team Cards List

The page displays a vertical list of team cards. Each card contains:

##### Team Card Structure

| Element | Description | Position |
|---------|-------------|----------|
| Team Logo/Avatar | Circular placeholder for team logo (gray circle) | Left side of card |
| Team Name | Bold text displaying "Team" (placeholder for actual team name) | Top center-left |
| Team Description | Brief description text (Lorem ipsum placeholder) | Below team name |
| Apply Button | Cyan/turquoise "Apply" button | Right side of card |

##### Card Visual Specifications
- **Background:** Gray (#808080 or similar)
- **Border Radius:** Rounded corners
- **Layout:** Horizontal flex layout
- **Spacing:** Consistent padding between cards
- **Shadow:** Subtle shadow for depth (optional)

##### Apply Button
- **Text:** "Apply"
- **Background Color:** Cyan/Turquoise (#00CED1 or similar)
- **Text Color:** Black
- **Border:** Rounded corners
- **Action:** Submit application to join the selected team

---

### Footer Section

#### Social Media Links (Left Side)
| Icon | Platform | Action |
|------|----------|--------|
| Twitter/X Icon | Twitter | Open Soccer Connect Twitter page |
| Instagram Icon | Instagram | Open Soccer Connect Instagram page |

#### Footer Navigation Links

**Column 1 - About:**
- About Us
- Mission Statement
- News
- Careers

**Column 2 - Support:**
- Contact Us
- Account Help
- Contact Form
- Business Opportunities

---

## UI Components Summary

| Component | Count | Type |
|-----------|-------|------|
| Header Logo | 1 | Image |
| Navigation Buttons | 4 | Button |
| User Action Buttons | 2 | Button |
| Team Cards | 3+ | Card Component |
| Apply Buttons | 1 per card | Button |
| Social Media Icons | 2 | Icon/Link |
| Footer Links | 8 | Text Link |

---

## Button Actions

### Primary Actions

| Button | Action | Expected Behavior |
|--------|--------|-------------------|
| Apply | Submit team application | Opens application modal or sends join request to team; requires user authentication |
| Account | View account | Redirects to `/account` or `/profile` page |
| Log Out | End session | Clears session, redirects to home/login page |

### Navigation Actions

| Button | Destination |
|--------|-------------|
| Team | `/teams` |
| Book a Field | `/book-field` |
| Classifieds | `/classifieds` |
| Events | `/events` |

### Footer Link Actions

| Link | Destination |
|------|-------------|
| About Us | `/about` |
| Mission Statement | `/mission` |
| News | `/news` |
| Careers | `/careers` |
| Contact Us | `/contact` |
| Account Help | `/help` or `/support` |
| Contact Form | `/contact-form` |
| Business Opportunities | `/business` |

---

## Suggested API Endpoints

### Team Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/teams` | Get all available teams | N/A | Array of team objects |
| GET | `/api/teams?search={query}` | Search teams by name or criteria | N/A | Filtered array of teams |
| GET | `/api/teams/:teamId` | Get specific team details | N/A | Team object |
| POST | `/api/teams/:teamId/apply` | Apply to join a team | `{ userId, message? }` | Application confirmation |
| GET | `/api/teams/:teamId/applications` | Get team applications (team admin) | N/A | Array of applications |

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/:userId/applications` | Get user's team applications |
| DELETE | `/api/users/:userId/applications/:appId` | Cancel/withdraw application |

---

## Data Requirements

### Team Object Schema

```json
{
  "id": "string (UUID)",
  "name": "string",
  "description": "string",
  "logo": "string (URL or null)",
  "location": "string",
  "skillLevel": "string (beginner/intermediate/advanced)",
  "ageGroup": "string (optional)",
  "currentMembers": "number",
  "maxMembers": "number",
  "isRecruiting": "boolean",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "captainId": "string (user UUID)"
}
```

### Team Application Schema

```json
{
  "id": "string (UUID)",
  "teamId": "string (UUID)",
  "userId": "string (UUID)",
  "status": "string (pending/approved/rejected)",
  "message": "string (optional)",
  "appliedAt": "datetime",
  "respondedAt": "datetime (nullable)"
}
```

### User Session Data Required

- User ID (for application submissions)
- Authentication token
- User profile information (for pre-filling applications)

---

## State Management Requirements

### Page State

| State | Type | Description |
|-------|------|-------------|
| teams | Array | List of teams fetched from API |
| loading | Boolean | Loading state for API calls |
| error | String/null | Error message if fetch fails |
| searchQuery | String | Current search filter (if search is added) |
| pagination | Object | Current page, total pages, items per page |

### User State

| State | Type | Description |
|-------|------|-------------|
| isAuthenticated | Boolean | Whether user is logged in |
| userId | String | Current user's ID |
| userApplications | Array | Teams user has already applied to |

---

## Future Enhancements (Suggested)

1. **Search/Filter Functionality**
   - Search bar for team name
   - Filter by skill level
   - Filter by location/area
   - Filter by age group

2. **Pagination**
   - Load more button or infinite scroll
   - Page numbers for large team lists

3. **Team Card Expansion**
   - Show more team details (member count, skill level)
   - View team profile link
   - Show application status if already applied

4. **Sorting Options**
   - Sort by name (A-Z, Z-A)
   - Sort by newest teams
   - Sort by available spots

---

## Accessibility Considerations

- All buttons should have appropriate aria-labels
- Team cards should be keyboard navigable
- Apply buttons should indicate loading state during submission
- Color contrast should meet WCAG 2.1 AA standards
- Images should have alt text
- Footer links should be grouped semantically

---

## Responsive Design Notes

- Navigation should collapse to hamburger menu on mobile
- Team cards should stack vertically on smaller screens
- Apply button should remain easily tappable (minimum 44x44px touch target)
- Footer should reorganize to single column on mobile
