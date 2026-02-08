# Teams Homepage - User Has Team

## Page Overview

| Property | Value |
|----------|-------|
| Page Name | Teams Homepage (Member View) |
| Route | `/team` or `/teams` |
| Purpose | Display the user's current team information, team members, and team news when the user is already part of a team |
| Access | Authenticated users who are members of a team |

---

## Page Layout

The page is divided into two main content sections arranged side by side:
- **Left Section**: Team information and member list
- **Right Section**: Team news feed

---

## UI Components

### 1. Header Section

#### Logo Area
- Soccer ball icon (top-left)
- Application name: **"Soccer Connect"**
- Tagline: *"A Place to connect and play in the GTA"*

#### Header Action Buttons
| Button | Style | Action |
|--------|-------|--------|
| Account | Cyan/turquoise background, black text | Navigate to user account settings |
| Log Out | Cyan/turquoise background, black text | Log out the current user and redirect to login page |

---

### 2. Main Navigation Bar

Horizontal navigation with four primary options:

| Button | Style | Navigation Target |
|--------|-------|-------------------|
| Team | Gray background, black text | Current page (Teams) |
| Book a Field | Cyan background, black text | Field booking page |
| Classifieds | Gray background, black text | Classifieds listings page |
| Events | Cyan background, black text | Events page |

---

### 3. Team Information Section (Left Column)

#### Section Header
- Title: **"Team"**
- Large font, bold styling

#### Team Details Card
| Element | Description |
|---------|-------------|
| Team Icon | Circular icon/logo placeholder (soccer ball or team logo) |
| Team Name | Large, bold text displaying the team's name |
| Team Description | Gray italic text showing team description (e.g., "Lorem Ipsum dolor sit amet, consectetur") |

---

### 4. Team Members List (Left Column)

Displays all team members in a vertical list format.

#### Member Card Structure

Each member card contains:

| Component | Position | Description |
|-----------|----------|-------------|
| Avatar | Left side | Circular placeholder for user profile image |
| Username | Top of text area | Bold text showing user's display name |
| Bio/Description | Below username | Secondary text with user's bio or additional info |
| Role Badge | Right side | Gray rounded badge displaying member's team role |

#### Member Card Layout
```
+----------------------------------------------------------+
|  [Avatar]  | User                          |   [Role]    |
|            | Lorem ipsum dolor sit amet    |             |
|            | ................              |             |
+----------------------------------------------------------+
```

#### Possible Roles
- Captain
- Co-Captain
- Member
- Substitute

---

### 5. Team Action Buttons

Located at the bottom of the Team section:

| Button | Style | Action |
|--------|-------|--------|
| Manage Team | Cyan/turquoise background, black text | Navigate to team management page (may be visible only to team captains/admins) |
| Leave Team | Red/coral background, white text | Trigger confirmation modal to leave the current team |

---

### 6. News Section (Right Column)

#### Section Header
- Title: **"News"**
- Large font, bold styling

#### News Card Structure

Each news card contains:

| Component | Position | Description |
|-----------|----------|-------------|
| Image | Left side | Thumbnail image related to the news item |
| Title | Top right | Bold heading text (e.g., "Ipsum") |
| Content | Below title | News body text describing the update |

#### News Card Layout
```
+----------------------------------------------------------+
|  [Image]     |  Title                                     |
|              |  Team News: Lorem ipsum dolor sit amet,    |
|              |  consectetur adipiscing elit.              |
+----------------------------------------------------------+
```

---

### 7. Footer Section

#### Social Media Links (Left)
- Twitter/X icon
- Instagram icon

#### Footer Navigation Links

| Column 1 | Column 2 |
|----------|----------|
| About Us | Contact Us |
| Mission Statement | Account Help |
| News | Contact Form |
| Careers | Business Opportunities |

---

## API Endpoints

### Required Endpoints

#### Team Information
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/teams/:teamId` | Fetch team details by ID |
| GET | `/api/teams/my-team` | Fetch current user's team |
| GET | `/api/teams/:teamId/members` | Fetch all members of a team |

#### Team Actions
| Method | Endpoint | Description |
|--------|----------|-------------|
| DELETE | `/api/teams/:teamId/members/:userId` | Leave team (remove self) |
| PUT | `/api/teams/:teamId` | Update team information (admin only) |

#### Team News
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/teams/:teamId/news` | Fetch team-specific news/announcements |
| GET | `/api/news?teamId=:teamId` | Alternative: Fetch news filtered by team |

#### User Information
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/:userId` | Fetch user profile for member cards |
| GET | `/api/users/me` | Fetch current user information |

---

## Data Requirements

### Team Object
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "logo": "string (URL)",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Team Member Object
```json
{
  "userId": "string",
  "teamId": "string",
  "username": "string",
  "avatar": "string (URL)",
  "bio": "string",
  "role": "string (Captain | Co-Captain | Member | Substitute)",
  "joinedAt": "datetime"
}
```

### News Object
```json
{
  "id": "string",
  "teamId": "string",
  "title": "string",
  "content": "string",
  "image": "string (URL)",
  "createdAt": "datetime",
  "author": "string"
}
```

### User Session Data
```json
{
  "userId": "string",
  "teamId": "string | null",
  "isAuthenticated": "boolean",
  "role": "string"
}
```

---

## User Interactions

### Button Actions

| Action | Trigger | Expected Behavior |
|--------|---------|-------------------|
| Account | Click "Account" button | Navigate to `/account` or `/profile` page |
| Log Out | Click "Log Out" button | Clear session, redirect to `/login` |
| Manage Team | Click "Manage Team" button | Navigate to `/team/manage` or `/team/:teamId/manage` |
| Leave Team | Click "Leave Team" button | Show confirmation modal, then call leave team API |
| Navigation | Click any nav button | Navigate to respective page |

### Leave Team Flow
1. User clicks "Leave Team" button
2. Confirmation modal appears: "Are you sure you want to leave [Team Name]?"
3. User confirms action
4. API call to remove user from team
5. Redirect to Teams Homepage (No Team view)

---

## Conditional Rendering

| Condition | UI Change |
|-----------|-----------|
| User is Captain | Show "Manage Team" button |
| User is not Captain | Hide "Manage Team" button OR show with limited options |
| No team news available | Show "No news yet" placeholder |
| Team has no logo | Show default team icon |

---

## Responsive Design Considerations

- On mobile devices, the two-column layout should stack vertically (Team section above News section)
- Member cards should remain full-width on smaller screens
- Navigation bar may collapse into a hamburger menu on mobile
- Action buttons should be easily tappable with appropriate sizing

---

## Related Pages

| Page | Description |
|------|-------------|
| Teams Homepage (No Team) | Shown when user is not part of any team |
| Team Management | For captains to manage team settings and members |
| Create Team | Page for creating a new team |
| Join Team | Page for browsing and joining existing teams |
