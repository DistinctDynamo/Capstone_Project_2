# Classifieds Listing Page

## Page Overview

**Page Name:** Classifieds Listing Page
**Route:** `/classifieds` (suggested)
**Purpose:** This page allows authenticated users to view, manage, and create classified postings. Users can post job opportunities or tryout announcements, view responses to their postings, and edit existing classifieds.

---

## UI Components

### 1. Header Section

#### Logo and Branding
- **Soccer ball logo** - positioned top-left
- **Application name:** "Soccer Connect"
- **Tagline:** "A Place to connect and play in the GTA"

#### User Actions (Top Right)
| Button | Style | Action |
|--------|-------|--------|
| Account | Cyan/turquoise filled button | Navigate to user account settings |
| Log Out | Cyan/turquoise filled button | Log out the current user and redirect to login page |

---

### 2. Main Navigation Menu

Horizontal navigation with cyan/turquoise filled buttons:

| Button | Action |
|--------|--------|
| Team | Navigate to team management page |
| Book a Field | Navigate to field booking page |
| Events | Navigate to events listing page |

---

### 3. Classifieds Action Buttons

Two primary action buttons for creating new classifieds:

| Button | Style | Action |
|--------|-------|--------|
| Post a Job | Cyan filled button with dark border | Opens form/modal to create a new job posting |
| Post a Tryout | Cyan filled button with dark border | Opens form/modal to create a new tryout announcement |

---

### 4. Posted Classifieds Section

#### Section Header
- **Title:** "Posted Classifieds"
- **Background:** Light gray section container

#### Classified Card Structure

Each classified posting is displayed as a card with the following elements:

| Element | Description |
|---------|-------------|
| Thumbnail/Icon | Circular placeholder image on the left side (likely for team logo or posting image) |
| Description Text | Multi-line text content describing the classified posting |
| Responses Button | Cyan filled button - view responses/applications to the posting |
| Edit Button | Cyan filled button - edit the classified posting |

**Card Layout:**
- Cards are displayed in a vertical list format
- Each card has a darker gray background
- Cards contain: circular image placeholder, text content, and action buttons
- Action buttons are aligned to the right side of each card

---

### 5. Back Navigation

| Button | Style | Action |
|--------|-------|--------|
| Back | Yellow/gold filled button | Navigate back to previous page or dashboard |

---

### 6. Footer Section

#### Social Media Links (Left Side)
- Twitter/X icon
- Instagram icon

#### About Us Column
- Mission Statement
- News
- Careers

#### Contact Us Column
- Account Help
- Contact Form
- Business Opportunities

---

## Button Actions Summary

| Button | Location | Expected Action |
|--------|----------|-----------------|
| Account | Header | Navigate to `/account` - user profile and settings |
| Log Out | Header | End user session, redirect to `/login` |
| Team | Navigation | Navigate to `/team` - team management |
| Book a Field | Navigation | Navigate to `/book-field` - field booking system |
| Events | Navigation | Navigate to `/events` - events listing |
| Post a Job | Classifieds Actions | Navigate to `/classifieds/create?type=job` or open modal |
| Post a Tryout | Classifieds Actions | Navigate to `/classifieds/create?type=tryout` or open modal |
| Responses | Classified Card | Navigate to `/classifieds/:id/responses` - view applications |
| Edit | Classified Card | Navigate to `/classifieds/:id/edit` or open edit modal |
| Back | Page Bottom | Navigate to previous page (history back) or dashboard |

---

## Suggested API Endpoints

### Classifieds CRUD Operations

```
GET    /api/classifieds                    - Get all classifieds for current user
GET    /api/classifieds/:id                - Get single classified by ID
POST   /api/classifieds                    - Create new classified (job or tryout)
PUT    /api/classifieds/:id                - Update existing classified
DELETE /api/classifieds/:id                - Delete classified
```

### Responses/Applications

```
GET    /api/classifieds/:id/responses      - Get all responses for a classified
POST   /api/classifieds/:id/responses      - Submit response/application to classified
PUT    /api/classifieds/:id/responses/:responseId  - Update response status
DELETE /api/classifieds/:id/responses/:responseId  - Delete response
```

### User Context

```
GET    /api/users/me/classifieds           - Get classifieds posted by current user
```

---

## Data Requirements

### Classified Model

```javascript
{
  id: String,                    // Unique identifier
  type: String,                  // "job" | "tryout"
  title: String,                 // Classified title
  description: String,           // Full description text
  image: String,                 // Optional image URL
  postedBy: {
    userId: String,              // User ID of poster
    teamId: String,              // Associated team (optional)
    teamName: String,            // Team name for display
  },
  location: String,              // Location/area
  compensation: String,          // For jobs - pay info (optional)
  dateTime: Date,                // For tryouts - when it takes place
  requirements: [String],        // List of requirements
  contactInfo: {
    email: String,
    phone: String,
  },
  status: String,                // "active" | "closed" | "draft"
  responsesCount: Number,        // Count of responses received
  createdAt: Date,
  updatedAt: Date,
}
```

### Response/Application Model

```javascript
{
  id: String,                    // Unique identifier
  classifiedId: String,          // Reference to classified
  applicant: {
    userId: String,
    name: String,
    email: String,
    phone: String,
  },
  message: String,               // Application message
  status: String,                // "pending" | "reviewed" | "accepted" | "rejected"
  createdAt: Date,
  updatedAt: Date,
}
```

---

## State Management Requirements

### Page State
- `classifieds: Array` - List of user's posted classifieds
- `loading: Boolean` - Loading state for API calls
- `error: String | null` - Error message if API call fails

### User Context
- `isAuthenticated: Boolean` - User must be logged in to access this page
- `currentUser: Object` - Current user information

---

## Access Control

- **Authentication Required:** Yes - user must be logged in
- **Authorization:** Users can only view/edit their own classifieds
- **Role-based access:** Team managers/admins may have additional permissions

---

## Responsive Design Considerations

- Navigation buttons should stack vertically on mobile
- Classified cards should be full-width on mobile
- Action buttons within cards should remain accessible
- Footer columns should stack on smaller screens

---

## Related Pages

- Classified Create/Edit Form
- Classified Responses Page
- Classified Detail View (public facing)
- Team Management Page
- User Account Page
