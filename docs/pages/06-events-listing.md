# Events Listing Page

## Page Overview

**Page Name:** Events Listing Page (Posted Events)

**Purpose:** This page displays a list of events that have been posted by the logged-in user. It serves as a management dashboard where users can view their created events, access reservation details, and edit event information.

**Access:** Authenticated users only (indicated by presence of Account and Log Out buttons)

---

## UI Components

### Header Section

#### Logo and Branding
- **Soccer Ball Icon:** Positioned in the top-left corner, serves as the application logo
- **Application Title:** "Soccer Connect" displayed prominently in bold black text
- **Tagline:** "A Place to connect and play in the GTA" positioned below the title

#### User Authentication Buttons (Top Right)
| Button | Style | Action |
|--------|-------|--------|
| Account | Cyan/turquoise with rounded corners, black text | Navigate to user account/profile page |
| Log Out | Cyan/turquoise with rounded corners, black text | Log out the current user and redirect to login page |

---

### Primary Navigation

A horizontal navigation bar with three main action buttons:

| Button | Style | Action |
|--------|-------|--------|
| Team | Cyan/turquoise with rounded corners and border, black text | Navigate to team management page |
| Book a Field | Cyan/turquoise with rounded corners and border, black text | Navigate to field booking page |
| Classifieds | Cyan/turquoise with rounded corners and border, black text | Navigate to classifieds/marketplace page |

---

### Main Content Area

#### Section Title
- **"Posted Events"** - Large, bold heading indicating the content section

#### Event Cards

Each event is displayed as a card/row with the following structure:

##### Event Card Structure
```
+-------------------------------------------------------------------+
| [Image Placeholder] | Event Description           | [Reservations] [Edit] |
|                     | (Lorem ipsum text...)       |                       |
+-------------------------------------------------------------------+
```

##### Card Components

| Component | Description | Position |
|-----------|-------------|----------|
| Event Image | Gray circular placeholder for event image/thumbnail | Left side |
| Event Description | Multi-line text description of the event | Center |
| Reservations Button | Cyan button with black text and border | Right side |
| Edit Button | Cyan button with black text | Far right |

##### Event Card Buttons

| Button | Style | Expected Action |
|--------|-------|-----------------|
| Reservations | Cyan with border, black text | View list of users who have reserved/signed up for this event |
| Edit | Cyan solid, black text | Navigate to event edit form to modify event details |

---

### Back Navigation

| Button | Style | Action |
|--------|-------|--------|
| Back | Yellow/gold with black text, centered | Navigate to previous page (likely dashboard or home) |

---

### Footer Section

The footer has a dark gray background and contains:

#### Social Media Links (Left Side)
- Twitter/X icon (bird logo)
- Instagram icon (camera logo)

#### Footer Navigation Links

**Column 1 - About Us:**
| Link | Description |
|------|-------------|
| Mission Statement | Navigate to mission statement page |
| News | Navigate to news/updates page |
| Careers | Navigate to careers/jobs page |

**Column 2 - Contact Us:**
| Link | Description |
|------|-------------|
| Account Help | Navigate to account support page |
| Contact Form | Navigate to contact form page |
| Business Opportunities | Navigate to business inquiries page |

---

## Data Requirements

### Event Object Structure

```json
{
  "id": "string (UUID)",
  "title": "string",
  "description": "string",
  "image_url": "string (optional)",
  "date": "date",
  "time": "time",
  "location": "string",
  "created_by": "string (user_id)",
  "created_at": "datetime",
  "updated_at": "datetime",
  "max_capacity": "number (optional)",
  "current_reservations": "number",
  "status": "string (active/cancelled/completed)"
}
```

### Reservation Object Structure

```json
{
  "id": "string (UUID)",
  "event_id": "string (UUID)",
  "user_id": "string (UUID)",
  "reserved_at": "datetime",
  "status": "string (confirmed/pending/cancelled)"
}
```

---

## Suggested API Endpoints

### Events Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events/user/:userId` | Get all events created by a specific user |
| GET | `/api/events/:eventId` | Get details of a specific event |
| PUT | `/api/events/:eventId` | Update an existing event |
| DELETE | `/api/events/:eventId` | Delete an event |

### Reservations Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events/:eventId/reservations` | Get all reservations for a specific event |
| GET | `/api/reservations/count/:eventId` | Get reservation count for an event |

### User/Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current logged-in user information |
| POST | `/api/auth/logout` | Log out the current user |

---

## User Interactions

### Primary Actions
1. **View Posted Events** - Page loads and displays all events created by the logged-in user
2. **View Reservations** - Click "Reservations" button to see who has signed up for an event
3. **Edit Event** - Click "Edit" button to modify event details
4. **Navigate Back** - Click "Back" button to return to previous page

### Secondary Actions
1. **Account Management** - Access account settings via "Account" button
2. **Log Out** - End session via "Log Out" button
3. **Navigation** - Access Team, Book a Field, or Classifieds pages
4. **Social Media** - Visit Twitter or Instagram pages
5. **Footer Links** - Access About Us or Contact Us pages

---

## Design Specifications

### Color Palette
| Element | Color |
|---------|-------|
| Primary Buttons | Cyan/Turquoise (#00BCD4 or similar) |
| Back Button | Yellow/Gold (#FFD700 or similar) |
| Header Background | White |
| Content Background | Light Gray (#E0E0E0 or similar) |
| Event Card Background | Gray (#9E9E9E or similar) |
| Footer Background | Dark Gray (#424242 or similar) |
| Text | Black |
| Footer Text | White |

### Typography
- **Title:** Bold, large sans-serif font
- **Tagline:** Regular weight, smaller size
- **Section Headers:** Bold, medium size
- **Body Text:** Regular weight

### Layout
- Responsive design with centered content
- Card-based layout for events
- Horizontal button groups for navigation
- Fixed footer with multi-column layout

---

## State Management

### Page States
1. **Loading** - Display loading indicator while fetching events
2. **Empty** - Display message when user has no posted events
3. **Populated** - Display list of event cards
4. **Error** - Display error message if events fail to load

### Authentication States
- Page requires authenticated user
- Redirect to login if user session is invalid
- Display user-specific events only

---

## Accessibility Considerations

1. All buttons should have appropriate ARIA labels
2. Images should have alt text descriptions
3. Color contrast should meet WCAG guidelines
4. Keyboard navigation should be supported
5. Screen reader compatibility for event cards

---

## Related Pages

- Event Creation Page (for creating new events)
- Event Detail Page (for viewing full event details)
- Event Edit Page (accessed via Edit button)
- Reservations Page (accessed via Reservations button)
- Account Page
- Team Page
- Book a Field Page
- Classifieds Page
