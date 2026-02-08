# Team Management Page

## Page Overview

**Page Name:** Manage Team
**URL Path:** `/team/manage` or `/team/:teamId/manage`
**Purpose:** This page allows team administrators and owners to manage their team members, including viewing the roster, changing member roles, removing members, creating team posts, inviting new members, and editing team settings.

**Access Level:** Restricted to team administrators and owners only.

---

## UI Components

### 1. Header Section

#### Logo
- **Location:** Top-left corner
- **Element:** Soccer ball icon with "Soccer Connect" branding
- **Tagline:** "A Place to connect and play in the GTA"

#### User Actions (Top-right)
- **Account Button:** Cyan/turquoise rounded button for accessing user account settings
- **Log Out Button:** Cyan/turquoise rounded button for user logout

### 2. Main Navigation Bar

Horizontal navigation with four main sections (cyan/turquoise rounded buttons):

| Button | Description |
|--------|-------------|
| **Team** | Navigate to team-related pages |
| **Book a Field** | Navigate to field booking functionality |
| **Classifieds** | Navigate to classifieds/listings section |
| **Events** | Navigate to events listing and management |

### 3. Page Title

- **Text:** "Manage Team"
- **Style:** Large, bold heading
- **Location:** Below navigation, left-aligned

### 4. Team Members List

A scrollable list displaying all team members with the following structure for each member card:

#### Member Card Components
| Element | Description |
|---------|-------------|
| **Profile Avatar** | Circular placeholder for user profile image (left side) |
| **Username** | Display name of the team member (bold text) |
| **User Description** | Brief description or role text (placeholder: "Lorem ipsum dolor sit amet...") |
| **Change Role Button** | Gray button to modify member's role within the team |
| **Kick Button** | Red button to remove member from the team |

#### Card Styling
- Background: Gray/dark gray
- Layout: Horizontal card with avatar on left, user info in center, action buttons on right
- Multiple cards stacked vertically

### 5. Team Action Sidebar

Located on the right side of the page, containing three action buttons:

| Button | Color | Purpose |
|--------|-------|---------|
| **Create Post** | Cyan/turquoise | Create a new team announcement or post |
| **Invite Member** | Cyan/turquoise | Send invitation to new members |
| **Edit Team** | Cyan/turquoise | Modify team settings, name, description, etc. |

### 6. Footer Section

#### Social Media Links
- **Twitter/X Icon:** Link to platform's Twitter account
- **Instagram Icon:** Link to platform's Instagram account

#### Footer Navigation Links

| Column 1 | Column 2 |
|----------|----------|
| About Us | Contact Us |
| Mission Statement | Account Help |
| News | Contact Form |
| Careers | Business Opportunities |

---

## Button Actions and Functionality

### Change Role Button
- **Trigger:** Click on "Change Role" button for specific member
- **Expected Behavior:**
  - Opens a modal/dropdown to select new role
  - Available roles may include: Member, Moderator, Co-Admin, Admin
  - Confirms role change before applying
- **Permissions:** Only admins can change roles; cannot change role of equal or higher-ranked members

### Kick Button
- **Trigger:** Click on red "Kick" button for specific member
- **Expected Behavior:**
  - Opens confirmation modal: "Are you sure you want to remove [username] from the team?"
  - On confirm: Removes member from team roster
  - Sends notification to removed member
- **Permissions:** Admins can kick members; cannot kick other admins or the owner

### Create Post Button
- **Trigger:** Click on "Create Post" button
- **Expected Behavior:**
  - Navigates to post creation page or opens a modal
  - Allows creation of team announcements visible to all team members
  - Options for text, images, and scheduling

### Invite Member Button
- **Trigger:** Click on "Invite Member" button
- **Expected Behavior:**
  - Opens modal with invitation options
  - Options may include: Search users by username/email, generate invite link, send email invitation
  - Tracks pending invitations

### Edit Team Button
- **Trigger:** Click on "Edit Team" button
- **Expected Behavior:**
  - Navigates to team settings page or opens modal
  - Editable fields: Team name, description, logo/avatar, privacy settings, team rules

---

## Member Management Functionality

### Viewing Members
- Display all current team members in a scrollable list
- Show basic member information (avatar, name, description/role)
- Support pagination or infinite scroll for large teams

### Role Hierarchy
1. **Owner** - Full control, cannot be kicked or demoted
2. **Admin** - Can manage members, posts, and settings
3. **Moderator** - Can manage posts and basic member actions
4. **Member** - Basic access, can view and participate

### Member Actions
- **View Profile:** Click on member name/avatar to view full profile
- **Change Role:** Modify member's permission level
- **Remove Member:** Kick member from the team with confirmation

---

## Navigation Elements

### Primary Navigation
- Team
- Book a Field
- Classifieds
- Events

### Header Navigation
- Account (user settings)
- Log Out (session termination)

### Footer Navigation
- About Us
- Mission Statement
- News
- Careers
- Contact Us
- Account Help
- Contact Form
- Business Opportunities

---

## Footer Content

### Social Media
- Twitter/X: Platform social media presence
- Instagram: Platform social media presence

### Company Information
- About Us: Company background and information
- Mission Statement: Platform goals and values
- News: Latest updates and announcements
- Careers: Job opportunities

### Support
- Contact Us: General contact information
- Account Help: User support and FAQ
- Contact Form: Direct support submission
- Business Opportunities: Partnership and business inquiries

---

## Suggested API Endpoints

### Team Members

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/teams/:teamId/members` | Fetch all members of a team |
| GET | `/api/teams/:teamId/members/:memberId` | Get specific member details |
| PUT | `/api/teams/:teamId/members/:memberId/role` | Update member role |
| DELETE | `/api/teams/:teamId/members/:memberId` | Remove member from team (kick) |

### Team Invitations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/teams/:teamId/invitations` | Create new invitation |
| GET | `/api/teams/:teamId/invitations` | List pending invitations |
| DELETE | `/api/teams/:teamId/invitations/:invitationId` | Cancel invitation |
| POST | `/api/teams/:teamId/invitations/link` | Generate shareable invite link |

### Team Posts

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/teams/:teamId/posts` | Create team post/announcement |
| GET | `/api/teams/:teamId/posts` | Get all team posts |
| PUT | `/api/teams/:teamId/posts/:postId` | Update team post |
| DELETE | `/api/teams/:teamId/posts/:postId` | Delete team post |

### Team Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/teams/:teamId` | Get team details |
| PUT | `/api/teams/:teamId` | Update team settings |
| DELETE | `/api/teams/:teamId` | Delete team (owner only) |

---

## Data Requirements

### Team Member Object
```json
{
  "id": "string",
  "userId": "string",
  "teamId": "string",
  "username": "string",
  "displayName": "string",
  "avatarUrl": "string",
  "role": "owner | admin | moderator | member",
  "bio": "string",
  "joinedAt": "datetime",
  "lastActive": "datetime"
}
```

### Team Object
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "logoUrl": "string",
  "ownerId": "string",
  "memberCount": "number",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "settings": {
    "isPublic": "boolean",
    "allowInviteLinks": "boolean",
    "maxMembers": "number"
  }
}
```

### Team Invitation Object
```json
{
  "id": "string",
  "teamId": "string",
  "invitedUserId": "string | null",
  "invitedEmail": "string | null",
  "inviteCode": "string",
  "invitedBy": "string",
  "status": "pending | accepted | declined | expired",
  "expiresAt": "datetime",
  "createdAt": "datetime"
}
```

### Team Post Object
```json
{
  "id": "string",
  "teamId": "string",
  "authorId": "string",
  "title": "string",
  "content": "string",
  "isPinned": "boolean",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Role Change Request
```json
{
  "newRole": "admin | moderator | member"
}
```

---

## User Permissions Matrix

| Action | Owner | Admin | Moderator | Member |
|--------|-------|-------|-----------|--------|
| View Members | Yes | Yes | Yes | Yes |
| Invite Members | Yes | Yes | Yes | No |
| Create Posts | Yes | Yes | Yes | No |
| Edit Team | Yes | Yes | No | No |
| Change Roles | Yes | Yes | No | No |
| Kick Members | Yes | Yes | No | No |
| Delete Team | Yes | No | No | No |

---

## Design Notes

### Color Scheme
- **Primary Action Buttons:** Cyan/Turquoise (#00BCD4 or similar)
- **Destructive Action (Kick):** Red (#F44336 or similar)
- **Neutral Buttons (Change Role):** Gray (#9E9E9E or similar)
- **Member Cards:** Dark Gray background
- **Footer:** Gray background with white/light text

### Responsive Considerations
- Member list should stack vertically on mobile
- Action sidebar buttons should move below member list on smaller screens
- Navigation should collapse into hamburger menu on mobile devices
