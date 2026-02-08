# Player Invite Page

## Page Overview

| Property | Value |
|----------|-------|
| Page Name | Player Invite |
| URL Route | `/team/invite` or `/player-invite` |
| Purpose | Allow team managers/captains to browse and invite available players to join their team |
| Access Level | Authenticated users (Team managers/captains only) |

## Page Description

The Player Invite page enables team managers and captains to search through a list of available players and send team invitations. This page displays user cards with basic player information and provides a simple one-click invite action.

---

## UI Components

### 1. Header Section

#### Logo Area
- **Soccer ball icon** - Application logo (top-left)
- **Application title**: "Soccer Connect"
- **Tagline**: "A Place to connect and play in the GTA"

#### Header Buttons (Top-right)
| Button | Style | Action |
|--------|-------|--------|
| Account | Cyan/turquoise with rounded corners | Navigate to user account/profile page |
| Log Out | Cyan/turquoise with rounded corners | Log out current user and redirect to login |

---

### 2. Navigation Bar

Horizontal navigation menu with four main sections:

| Button | Style | Destination |
|--------|-------|-------------|
| Team | Cyan button, rounded corners | Team management/dashboard page |
| Book a Field | Cyan button, rounded corners | Field booking page |
| Classifieds | Cyan button, rounded corners | Classifieds/marketplace page |
| Events | Cyan button, rounded corners | Events listing page |

---

### 3. Page Title

- **Title Text**: "Player Invite"
- **Typography**: Large, bold black text
- **Position**: Left-aligned below navigation

---

### 4. User Card List

A scrollable list of user cards displaying available players.

#### User Card Structure

Each card contains:

| Element | Description | Position |
|---------|-------------|----------|
| Profile Avatar | Circular placeholder/profile image (light gray) | Left side |
| Username | Bold text displaying user's name or username | Top-center |
| Bio/Description | Secondary text with user bio or player description | Below username |
| Invite Button | Cyan button with "Invite" text | Right side |

#### Card Styling
- **Background**: Gray (#9E9E9E or similar)
- **Border Radius**: Rounded corners
- **Layout**: Horizontal flex with avatar, text content, and action button
- **Spacing**: Margin between cards for visual separation

---

### 5. Footer Section

#### Footer Background
- Gray background bar spanning full width

#### Social Media Icons (Left side)
| Icon | Platform | Action |
|------|----------|--------|
| Twitter/X icon | Twitter | Link to Soccer Connect Twitter page |
| Instagram icon | Instagram | Link to Soccer Connect Instagram page |

#### Footer Links (Center-right)

**Column 1 - About**
- About Us
- Mission Statement
- News
- Careers

**Column 2 - Support**
- Contact Us
- Account Help
- Contact Form
- Business Opportunities

---

## Button Actions

### Primary Actions

| Button | Action | Expected Behavior |
|--------|--------|-------------------|
| Invite | Send team invitation to player | Triggers API call to send invitation; button state changes to "Pending" or "Invited"; shows success/error notification |
| Account | Navigate to account page | Redirect to `/account` or `/profile` |
| Log Out | End user session | Clear session, redirect to login page |

### Navigation Actions

| Button | Destination Route |
|--------|-------------------|
| Team | `/team` or `/team/dashboard` |
| Book a Field | `/book-field` |
| Classifieds | `/classifieds` |
| Events | `/events` |

---

## Suggested API Endpoints

### GET Endpoints

| Endpoint | Description | Response |
|----------|-------------|----------|
| `GET /api/players/available` | Fetch list of players available for invitation | Array of player objects |
| `GET /api/players/available?search={query}` | Search available players by name | Filtered array of player objects |
| `GET /api/team/:teamId/invites` | Get pending invitations for a team | Array of pending invites |

### POST Endpoints

| Endpoint | Description | Request Body | Response |
|----------|-------------|--------------|----------|
| `POST /api/team/:teamId/invite` | Send invitation to a player | `{ playerId: string }` | Invitation object |
| `POST /api/invites/:inviteId/cancel` | Cancel a pending invitation | None | Success message |

### Response Examples

#### Player Object
```json
{
  "id": "player_123",
  "username": "User",
  "displayName": "User",
  "bio": "Lorem ipsum dolor sit amet...",
  "avatar": "https://example.com/avatar.jpg",
  "position": "Midfielder",
  "skillLevel": "Intermediate",
  "availability": true
}
```

#### Invite Object
```json
{
  "id": "invite_456",
  "teamId": "team_789",
  "playerId": "player_123",
  "status": "pending",
  "sentAt": "2024-01-15T10:30:00Z",
  "expiresAt": "2024-01-22T10:30:00Z"
}
```

---

## Data Requirements

### Page Load Data

| Data Field | Type | Source | Required |
|------------|------|--------|----------|
| Current User | Object | Auth context/session | Yes |
| Team ID | String | URL params or context | Yes |
| Available Players | Array | API fetch | Yes |
| Pending Invites | Array | API fetch | No |

### User Card Data Fields

| Field | Type | Description | Display |
|-------|------|-------------|---------|
| id | String | Unique player identifier | Hidden |
| username | String | Player's username | Shown as title |
| bio | String | Player's bio/description | Shown as subtitle |
| avatar | String (URL) | Profile picture URL | Shown as circular image |
| isInvited | Boolean | Whether player already has pending invite | Controls button state |

### State Management

| State | Type | Purpose |
|-------|------|---------|
| players | Array | List of available players |
| loading | Boolean | Loading state for API calls |
| searchQuery | String | Filter players by search term |
| invitedPlayers | Set/Array | Track which players have been invited |
| error | String/null | Error message display |

---

## Additional Considerations

### Pagination/Infinite Scroll
- Implement pagination or infinite scroll for large player lists
- Suggested page size: 10-20 players per request

### Search/Filter (Future Enhancement)
- Add search bar to filter players by name
- Add filters for position, skill level, availability

### Error Handling
- Display error toast/notification on failed invite
- Handle network errors gracefully
- Show loading state while fetching players

### Accessibility
- Ensure all buttons have appropriate ARIA labels
- Support keyboard navigation through player list
- Provide screen reader support for user cards

### Responsive Design
- Stack user cards vertically on mobile
- Adjust card layout for smaller screens
- Collapse navigation into hamburger menu on mobile
