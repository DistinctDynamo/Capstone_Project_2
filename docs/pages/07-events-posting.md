# Events Posting Page

## Page Overview

**Page Name:** Event Posting / Create Event
**Purpose:** Allows authenticated users to create and publish new event listings on the Soccer Connect platform. Users can provide event details including title, description, and an optional image to promote soccer-related events in the GTA (Greater Toronto Area).

---

## UI Components

### Header Section

| Component | Description |
|-----------|-------------|
| Logo | Soccer ball icon (top-left corner) |
| Brand Name | "Soccer Connect" - main application title |
| Tagline | "A Place to connect and play in the GTA" |
| Account Button | Teal/cyan colored button for account management |
| Log Out Button | Teal/cyan colored button to end user session |

### Navigation Bar

| Button | Style | Expected Action |
|--------|-------|-----------------|
| Team | Teal button with rounded corners | Navigate to Team management/listing page |
| Book a Field | Teal button with rounded corners | Navigate to Field booking page |
| Classifieds | Teal button with rounded corners | Navigate to Classifieds listings page |

### Main Content Area - Event Form

The form is contained within a light gray container with the heading "Event".

#### Form Fields

| Field | Type | Description | Validation Requirements |
|-------|------|-------------|------------------------|
| Title | Text Input | Single-line text field for event name | Required, Max 100 characters, No empty strings |
| Description | Textarea | Multi-line text area (3 lines visible) for detailed event information | Required, Max 2000 characters, Min 10 characters |
| Upload Image | File Upload Button | Gray button to upload event promotional image | Optional, Accepted formats: JPG, PNG, GIF, Max size: 5MB |

### Action Buttons

| Button | Style | Expected Action |
|--------|-------|-----------------|
| Post | Teal button with dark border | Submit the event form, validate inputs, and create the event |
| Back | Teal button with dark border | Cancel event creation and return to previous page (Events listing) |

### Footer Section

#### Social Media Links (Left Side)
- Twitter/X icon
- Instagram icon

#### Footer Links (Center-Right)

| Column 1 | Column 2 |
|----------|----------|
| About Us | Contact Us |
| Mission Statement | Account Help |
| News | Contact Form |
| Careers | Business Opportunities |

---

## Navigation Flow

```
Events Posting Page
    |
    |-- [Post Button] --> Events Listing Page (on success)
    |                 --> Stay on page with error message (on validation failure)
    |
    |-- [Back Button] --> Events Listing Page
    |
    |-- [Team] --> Team Page
    |-- [Book a Field] --> Field Booking Page
    |-- [Classifieds] --> Classifieds Page
    |-- [Account] --> Account Settings Page
    |-- [Log Out] --> Login Page / Home Page
    |
    |-- [Logo] --> Home Page
```

---

## Suggested API Endpoints

### Primary Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/api/events` | Create a new event | `{ title, description, image?, userId }` |
| POST | `/api/events/upload` | Upload event image | `multipart/form-data` with image file |

### Supporting Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current authenticated user info |
| POST | `/api/auth/logout` | End user session |

### Request/Response Examples

#### Create Event Request
```json
POST /api/events
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Weekend Soccer Tournament",
  "description": "Join us for a fun weekend tournament at High Park...",
  "imageUrl": "https://storage.example.com/events/image123.jpg"
}
```

#### Create Event Response
```json
{
  "success": true,
  "data": {
    "id": "evt_12345",
    "title": "Weekend Soccer Tournament",
    "description": "Join us for a fun weekend tournament at High Park...",
    "imageUrl": "https://storage.example.com/events/image123.jpg",
    "authorId": "user_67890",
    "createdAt": "2026-02-06T12:00:00Z",
    "updatedAt": "2026-02-06T12:00:00Z"
  }
}
```

#### Image Upload Request
```json
POST /api/events/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

{
  "file": <binary image data>
}
```

#### Image Upload Response
```json
{
  "success": true,
  "data": {
    "imageUrl": "https://storage.example.com/events/image123.jpg",
    "fileName": "image123.jpg",
    "fileSize": 245678
  }
}
```

---

## Data Requirements

### Event Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String/UUID | Auto-generated | Unique event identifier |
| title | String | Yes | Event title (max 100 chars) |
| description | String | Yes | Event description (max 2000 chars) |
| imageUrl | String | No | URL to uploaded event image |
| authorId | String/UUID | Yes | Reference to user who created the event |
| status | Enum | Yes | Event status (draft, published, cancelled) |
| createdAt | DateTime | Auto-generated | Timestamp of creation |
| updatedAt | DateTime | Auto-generated | Timestamp of last update |

### User Entity (Required Fields for This Feature)

| Field | Type | Description |
|-------|------|-------------|
| id | String/UUID | Unique user identifier |
| email | String | User email address |
| name | String | User display name |
| isAuthenticated | Boolean | Current authentication status |

---

## Validation Requirements

### Client-Side Validation

| Field | Validation Rules |
|-------|------------------|
| Title | Required, 1-100 characters, trim whitespace |
| Description | Required, 10-2000 characters |
| Image | Optional, file type must be image/jpeg, image/png, or image/gif, max 5MB |

### Server-Side Validation

| Field | Validation Rules |
|-------|------------------|
| Title | Required, 1-100 characters, sanitize HTML/XSS |
| Description | Required, 10-2000 characters, sanitize HTML/XSS |
| Image | Validate MIME type, scan for malware, max 5MB |
| User | Must be authenticated, valid session token |

### Error Messages

| Scenario | Error Message |
|----------|---------------|
| Empty title | "Please enter an event title" |
| Title too long | "Title must be 100 characters or less" |
| Empty description | "Please enter an event description" |
| Description too short | "Description must be at least 10 characters" |
| Description too long | "Description must be 2000 characters or less" |
| Invalid image type | "Please upload a valid image file (JPG, PNG, or GIF)" |
| Image too large | "Image must be smaller than 5MB" |
| Upload failed | "Failed to upload image. Please try again" |
| Unauthorized | "Please log in to create an event" |
| Server error | "Something went wrong. Please try again later" |

---

## Authentication Requirements

- User must be logged in to access this page
- Unauthenticated users should be redirected to the login page
- Session token must be included in all API requests
- Token expiration should trigger re-authentication

---

## Accessibility Considerations

- All form fields should have associated labels
- Error messages should be announced to screen readers
- Form should be navigable via keyboard
- Upload button should have clear focus states
- Color contrast should meet WCAG 2.1 AA standards

---

## State Management

### Form States

| State | Description |
|-------|-------------|
| Initial | Empty form, Post button enabled |
| Editing | User has entered data, unsaved changes |
| Uploading | Image upload in progress, show loading indicator |
| Submitting | Form submission in progress, buttons disabled |
| Success | Event created, redirect to events listing |
| Error | Display error message, keep form data |

### Loading States

- Image upload: Show progress indicator on upload button
- Form submission: Disable Post button, show spinner
- Navigation: Show loading state during page transitions

---

## Related Pages

- Events Listing Page (parent page)
- Event Detail Page (view created event)
- Account Settings Page
- Login Page
