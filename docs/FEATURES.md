# GTA Soccer Connect - Feature Documentation

## Overview

**Soccer Connect** is a web application designed to connect soccer enthusiasts in the Greater Toronto Area (GTA). The platform enables users to communicate, organize games, book fields, manage teams, and find opportunities within the soccer community.

**Tagline:** "A Place to connect and play in the GTA"

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| MongoDB | Database |
| Express.js | Backend Framework |
| React.js | Frontend UI |
| Node.js | Runtime Environment |
| JavaScript | Programming Language |

---

## Core Features

### 1. Authentication & User Management

#### 1.1 Account Creation (Sign Up)
- **Fields:**
  - First Name (required)
  - Last Name (required)
  - Email (required, unique)
  - Username (required, unique)
  - Account Type (dropdown: Player, etc.)
  - Password (required)
  - Confirm Password (required)
- **Actions:**
  - Create Account button
  - Back button (return to home)
- **Validation:**
  - Password confirmation match
  - Email format validation
  - Username uniqueness check

#### 1.2 Sign In (Login)
- **Fields:**
  - Username
  - Password
- **Actions:**
  - Sign-In button
  - Back button
  - Forgot Password? link
- **Features:**
  - Password hashing with bcrypt
  - Session management

#### 1.3 Account Page (User Profile)
- **Profile Information Section:**
  - Profile Image (with "Change Image" option)
  - First Name
  - Last Name
  - Email
  - Password
  - Confirm Password
  - Edit button
- **Player Statistics Section:**
  - Goals Scored
  - Games Played
  - Teams Played On
  - Goals Defended
  - Positions Played
  - Update button
- **Quick Navigation:**
  - Team
  - Book a Field
  - Classifieds
  - Events
- **Actions:**
  - Log Out button

---

### 2. Home Page

#### 2.1 Public Home Page (Not Logged In)
- **Header:**
  - Soccer Connect logo
  - Create Account button
  - Log in button
- **Hero Section:**
  - Welcome message and mission statement
  - "Here at Soccer Connect, our goal is to connect the people of the GTA in celebration of our favorite game"
- **Feature Highlights:**
  - **Communicate:** Single and group messaging systems
  - **Organize:** Book fields from local to provincial level across GTA
  - **Build Up:** Platform for organizations to post job offers
- **Footer:**
  - Social media links (Twitter, Instagram)
  - About Us section (Mission Statement, News, Careers)
  - Contact Us section (Account Help, Contact Form, Business Opportunities)

#### 2.2 Logged In Main Page (Dashboard)
- **Header:**
  - Soccer Connect logo
  - Account button
  - Log Out button
- **Navigation Bar:**
  - Team
  - Book a Field
  - Classifieds
  - Events
- **News Section:**
  - News articles with images
  - Article title and description
- **Events Widget:**
  - List of upcoming events
- **Messages Widget:**
  - Recent conversations preview
  - User messages
  - Group messages
  - Messages button (navigate to full messaging)
- **Footer:**
  - Same as public home page

---

### 3. Events Module

#### 3.1 Events Listing Page
- **Navigation:** Team, Book a Field, Classifieds tabs
- **Posted Events Section:**
  - Event cards with:
    - Event image/thumbnail
    - Event description
    - Reservations button (view/manage reservations)
    - Edit button (for event creators)
- **Actions:**
  - Back button

#### 3.2 Event Posting/Creation
- **Form Fields:**
  - Title (required)
  - Description (multi-line, required)
  - Upload Image button
- **Actions:**
  - Post button
  - Back button

#### 3.3 Event Data Model
- Title
- Date Posted (auto-generated)
- Description
- Location
- Interest count (number of interested users)
- Price (0 for free events)

---

### 4. Classifieds Module

#### 4.1 Classifieds Listing Page
- **Navigation:** Team, Book a Field, Events tabs
- **Sub-categories:**
  - Post a Job button
  - Post a Tryout button
- **Posted Classifieds Section:**
  - Classified cards with:
    - Image/thumbnail
    - Description
    - Responses button (view applicants/interested users)
    - Edit button (for poster)
- **Actions:**
  - Back button

#### 4.2 Classified Posting/Creation
- **Form Fields:**
  - Title (required)
  - Description (multi-line, required)
  - Upload Image button
- **Types:**
  - Job postings
  - Tryout announcements
- **Actions:**
  - Post button
  - Back button

#### 4.3 Classified Data Model
- Classified Type (Job, Tryout, etc.)
- Name/Title
- Description
- Date Posted (auto-generated)
- Location

---

### 5. Teams Module

#### 5.1 Team Homepage - No Team State
- Users without a team see two options:
  - **Create Team** - Start a new team
  - **Find Team** - Search for existing teams to join

#### 5.2 Team Homepage - Has Team State
- **Team Information:**
  - Team logo/image
  - Team Name
  - Team Description
- **Team Members List:**
  - Member avatar
  - Member username
  - Member description/bio
  - Member role (displayed as button/badge)
- **Team News Section:**
  - News articles specific to the team
  - Article images and descriptions
- **Actions:**
  - Manage Team button
  - Leave Team button (red, destructive action)

#### 5.3 Team Creation
- **Form Fields:**
  - Team Logo (Upload Logo button)
  - Team Name (required)
  - Description
- **Actions:**
  - Create Team button

#### 5.4 Team Search (Find Team)
- **Search Results:**
  - Team cards with:
    - Team logo/avatar
    - Team name
    - Team description
    - Apply button (request to join)

#### 5.5 Team Management (Admin/Manager View)
- **Member Management:**
  - List of all team members with:
    - Member avatar
    - Member username
    - Member description
    - Change Role button
    - Kick button (red, remove member)
- **Team Actions:**
  - Create Post button (team news/announcements)
  - Invite Member button
  - Edit Team button

#### 5.6 Player Invite
- **Invite Interface:**
  - List of users to invite with:
    - User avatar
    - Username
    - User description
    - Invite button

#### 5.7 Team Data Model
- Team Name
- Members (array of user IDs)
- Date of Creation
- Team Logo/Image (planned)
- Description

---

### 6. Book a Field Module

#### 6.1 Field Listings
- **Available Fields:**
  - Field cards with:
    - Field image
    - Field name
    - Field description/details
- **Scrollable list of venues**

#### 6.2 Field Scheduling/Booking
- **Booking Interface:**
  - Field image
  - Field name
  - Week selector (dropdown)
  - Day selector (numbered days: 1, 2, 3, 4, 5, with navigation arrows)
  - Time slots display:
    - Available slots (highlighted in cyan)
    - Booked/unavailable slots (grayed out)
- **Actions:**
  - Book button
  - Back button

#### 6.3 Field Data Model (Planned)
- Field Name
- Location
- Description
- Images
- Availability Schedule
- Pricing

---

### 7. Messaging Module

#### 7.1 Messages Page
- **Chat List (Left Panel):**
  - List of conversations:
    - User avatar
    - Username or Group name
    - Message preview
  - Supports both:
    - Direct messages (1-on-1)
    - Group chats
- **Chat Window (Right Panel):**
  - Message bubbles:
    - Incoming messages (left-aligned)
    - Outgoing messages (right-aligned)
  - Message input field
  - Send button

#### 7.2 Message Widget (Dashboard)
- Quick preview of recent messages
- Direct access to messaging from dashboard

---

### 8. Search Functionality

#### 8.1 Global Search
- Search bar with magnifying glass icon
- Placeholder text: "Search"
- Appears in various contexts for filtering content

---

### 9. Common UI Components

#### 9.1 Header (Logged Out)
- Logo
- Create Account button (cyan)
- Log in button (cyan)

#### 9.2 Header (Logged In)
- Logo
- Account button (cyan)
- Log Out button (cyan)

#### 9.3 Navigation Bar
- Team
- Book a Field
- Classifieds
- Events
- (Tabs vary based on current page context)

#### 9.4 Footer
- Social Media Links:
  - Twitter icon
  - Instagram icon
- About Us:
  - Mission Statement
  - News
  - Careers
- Contact Us:
  - Account Help
  - Contact Form
  - Business Opportunities

#### 9.5 Button Styles
- **Primary (Cyan):** Main actions
- **Secondary (Yellow/Orange):** Back, Cancel actions
- **Destructive (Red):** Delete, Kick, Leave actions

---

## User Roles & Permissions

### Player (Default User)
- Create/edit own profile
- View/track personal statistics
- Join/leave teams
- Create/view events
- Create/view classifieds
- Book fields
- Send/receive messages

### Team Manager/Admin
- All Player permissions
- Manage team members (invite, kick, change roles)
- Edit team information
- Create team posts/news

### Admin (Planned)
- All permissions
- Manage all users
- Moderate content
- System configuration

---

## Data Models Summary

### User
| Field | Type | Required |
|-------|------|----------|
| username | String | Yes |
| first_name | String | Yes |
| last_name | String | Yes |
| email | String | Yes |
| password | String | Yes (hashed) |
| user_type | String | Yes |
| created_at | Date | Auto |
| updated_at | Date | Auto |
| games_played | Number | No |
| goals | Number | No |
| assists | Number | No |
| passes | Number | No |
| team_role | String | No |

### Event
| Field | Type | Required |
|-------|------|----------|
| title | String | Yes |
| date_posted | Date | Auto |
| description | String | Yes |
| location | String | Yes |
| interest | Number | No |
| price | Number | No |

### Team
| Field | Type | Required |
|-------|------|----------|
| team_name | String | Yes |
| members | Array | No |
| date_of_creation | Date | Auto |
| logo | String | Planned |
| description | String | No |

### Classified
| Field | Type | Required |
|-------|------|----------|
| classified_type | String | Yes |
| name | String | Yes |
| description | String | Yes |
| date_posted | Date | Auto |
| location | String | Yes |

---

## API Routes

### User Routes (Implemented)
- `POST /user/signup` - Create new user account
- `POST /user/login` - Authenticate user

### Event Routes (Planned)
- `GET /events` - List all events
- `GET /events/:id` - Get single event
- `POST /events` - Create new event
- `PUT /events/:id` - Update event
- `DELETE /events/:id` - Delete event

### Team Routes (Planned)
- `GET /teams` - List all teams
- `GET /teams/:id` - Get single team
- `POST /teams` - Create new team
- `PUT /teams/:id` - Update team
- `DELETE /teams/:id` - Delete team
- `POST /teams/:id/members` - Add member
- `DELETE /teams/:id/members/:userId` - Remove member

### Classified Routes (Planned)
- `GET /classifieds` - List all classifieds
- `GET /classifieds/:id` - Get single classified
- `POST /classifieds` - Create new classified
- `PUT /classifieds/:id` - Update classified
- `DELETE /classifieds/:id` - Delete classified

### Field/Booking Routes (Planned)
- `GET /fields` - List all fields
- `GET /fields/:id` - Get single field
- `GET /fields/:id/availability` - Get field availability
- `POST /bookings` - Create booking
- `DELETE /bookings/:id` - Cancel booking

### Message Routes (Planned)
- `GET /messages` - Get user's conversations
- `GET /messages/:conversationId` - Get messages in conversation
- `POST /messages` - Send message
- `POST /conversations` - Start new conversation

---

## Future Enhancements (Identified TODOs)

1. **User Profile Image Upload** - Allow users to upload profile pictures
2. **Team Logo Upload** - Allow teams to have custom logos
3. **Field Management System** - Full booking and availability system
4. **Real-time Messaging** - WebSocket-based messaging
5. **Notification System** - Push notifications for messages, invites, etc.
6. **Payment Integration** - For field bookings and event registrations
7. **Advanced Search** - Filter by location, availability, skill level
8. **Mobile App** - React Native companion app

---

## Page Flow Summary

```
Home Page (Public)
    ├── Create Account → Account Creation → Login
    └── Login → Sign In → Dashboard

Dashboard (Logged In)
    ├── Account → Account Page
    ├── Team → Team Homepage
    │       ├── (No Team) → Create Team / Find Team
    │       └── (Has Team) → Team View → Manage Team
    ├── Book a Field → Field Listings → Field Scheduling
    ├── Classifieds → Classifieds Listing → Post Classified
    ├── Events → Events Listing → Post Event
    └── Messages → Messaging Page
```

---

*Document generated from Figma designs and technical requirements for Capstone Project Team 46*
