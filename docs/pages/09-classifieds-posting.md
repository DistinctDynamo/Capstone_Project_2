# Classifieds Posting Page

## Page Overview

**Page Name:** Classifieds Posting Page
**Purpose:** Allows authenticated users to create and submit new classified advertisements to the Soccer Connect platform. Users can post items for sale, services, or other soccer-related listings with a title, description, and optional image.

---

## UI Components

### Header Section

#### Logo Area
- **Soccer ball icon** - Application logo positioned top-left
- **Application name** - "Soccer Connect" displayed in bold black text
- **Tagline** - "A Place to connect and play in the GTA" in smaller text below the title

#### Navigation Buttons (Top Right)
| Button | Style | Expected Action |
|--------|-------|-----------------|
| Account | Cyan/turquoise with rounded corners | Navigates to user account/profile page |
| Log Out | Cyan/turquoise with rounded corners | Logs out the current user and redirects to login page |

#### Primary Navigation Menu
| Button | Style | Expected Action |
|--------|-------|-----------------|
| Team | Cyan/turquoise with rounded corners and border | Navigates to team management/listing page |
| Book a Field | Cyan/turquoise with rounded corners and border | Navigates to field booking page |
| Events | Cyan/turquoise with rounded corners and border | Navigates to events listing page |

---

### Main Content Section

#### Form Container
- **Background:** Light gray container with rounded corners
- **Section Title:** "Information" displayed as a heading

#### Form Fields

| Field Name | Input Type | Required | Validation Requirements |
|------------|------------|----------|------------------------|
| Title | Text input (single line) | Yes | - Minimum 3 characters<br>- Maximum 100 characters<br>- Cannot be empty<br>- Should not contain special characters that could cause XSS |
| Description | Textarea (multi-line, 3 rows visible) | Yes | - Minimum 10 characters<br>- Maximum 2000 characters<br>- Cannot be empty<br>- Should sanitize HTML content |

#### Image Upload Component
| Element | Description | Validation Requirements |
|---------|-------------|------------------------|
| Upload Image Button | Gray rectangular button centered below form fields | - Accepted formats: JPG, PNG, GIF, WebP<br>- Maximum file size: 5MB<br>- Optional field<br>- Should display preview after selection |

---

### Action Buttons

| Button | Style | Position | Expected Action |
|--------|-------|----------|-----------------|
| Post | Cyan/turquoise with rounded corners | Bottom left of button group | Validates form and submits the classified posting to the server |
| Back | Cyan/turquoise with rounded corners | Bottom right of button group | Cancels the posting and returns to the classifieds listing page |

---

### Footer Section

#### Social Media Links (Left Side)
| Icon | Platform | Expected Action |
|------|----------|-----------------|
| Twitter/X icon | Twitter/X | Opens Soccer Connect Twitter page in new tab |
| Instagram icon | Instagram | Opens Soccer Connect Instagram page in new tab |

#### Footer Navigation Links

**About Us Column:**
- Mission Statement
- News
- Careers

**Contact Us Column:**
- Account Help
- Contact Form
- Business Opportunities

---

## Navigation Flow

```
Classifieds Listing Page
        |
        v
Classifieds Posting Page (Current)
        |
        +--> [Post] --> Success --> Classifieds Listing Page (with new post)
        |                  |
        |                  +--> Error --> Stay on page with error message
        |
        +--> [Back] --> Classifieds Listing Page (no changes)
```

---

## Suggested API Endpoints

### Primary Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/api/classifieds` | Create a new classified posting | `{ title, description, imageUrl?, userId }` |
| POST | `/api/uploads/image` | Upload image for classified | `FormData { image: File }` |

### Supporting Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/classifieds/categories` | Get available categories (if categorization is added) |
| GET | `/api/users/:id` | Get current user info for posting attribution |

### Request/Response Examples

#### Create Classified Post
```json
// POST /api/classifieds
// Request
{
  "title": "Soccer Cleats for Sale",
  "description": "Brand new Adidas Predator cleats, size 10. Never worn, still in box.",
  "imageUrl": "https://storage.example.com/images/abc123.jpg",
  "userId": "user_123"
}

// Response (201 Created)
{
  "id": "classified_456",
  "title": "Soccer Cleats for Sale",
  "description": "Brand new Adidas Predator cleats, size 10. Never worn, still in box.",
  "imageUrl": "https://storage.example.com/images/abc123.jpg",
  "userId": "user_123",
  "createdAt": "2024-01-15T10:30:00Z",
  "status": "active"
}
```

#### Upload Image
```json
// POST /api/uploads/image
// Request: FormData with 'image' field

// Response (200 OK)
{
  "url": "https://storage.example.com/images/abc123.jpg",
  "filename": "abc123.jpg",
  "size": 245678
}
```

---

## Data Requirements

### Classified Post Model

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String (UUID) | Auto-generated | Unique identifier for the posting |
| title | String | Yes | Title of the classified ad (3-100 chars) |
| description | String | Yes | Detailed description (10-2000 chars) |
| imageUrl | String | No | URL to uploaded image |
| userId | String (UUID) | Yes | Reference to the posting user |
| createdAt | DateTime | Auto-generated | Timestamp of creation |
| updatedAt | DateTime | Auto-generated | Timestamp of last update |
| status | Enum | Default: 'active' | Status: 'active', 'sold', 'expired', 'deleted' |

### User Reference Data

| Field | Type | Description |
|-------|------|-------------|
| userId | String (UUID) | User creating the post |
| username | String | Display name for attribution |
| contactEmail | String | Email for interested parties to contact |

---

## Validation Rules

### Client-Side Validation

1. **Title Field**
   - Required field indicator
   - Real-time character count
   - Minimum 3 characters
   - Maximum 100 characters
   - Trim whitespace

2. **Description Field**
   - Required field indicator
   - Real-time character count
   - Minimum 10 characters
   - Maximum 2000 characters
   - Preserve line breaks

3. **Image Upload**
   - File type validation before upload
   - File size check (max 5MB)
   - Display preview after selection
   - Option to remove selected image

### Server-Side Validation

1. **Authentication Check**
   - User must be logged in
   - Valid session token required

2. **Input Sanitization**
   - Strip HTML tags from title and description
   - Prevent XSS attacks
   - Validate image URL format

3. **Rate Limiting**
   - Maximum 10 posts per user per day
   - Prevent spam submissions

---

## Error Handling

| Error Scenario | User Message | HTTP Status |
|----------------|--------------|-------------|
| Empty title | "Please enter a title for your posting" | 400 |
| Empty description | "Please provide a description" | 400 |
| Title too short | "Title must be at least 3 characters" | 400 |
| Description too short | "Description must be at least 10 characters" | 400 |
| Image too large | "Image must be less than 5MB" | 400 |
| Invalid image format | "Please upload a JPG, PNG, GIF, or WebP image" | 400 |
| Not authenticated | "Please log in to create a posting" | 401 |
| Server error | "Something went wrong. Please try again later." | 500 |

---

## Accessibility Requirements

- All form fields must have associated labels
- Error messages must be announced to screen readers
- Upload button must be keyboard accessible
- Color contrast must meet WCAG 2.1 AA standards
- Focus indicators must be visible on all interactive elements

---

## Future Enhancements (Suggested)

1. **Category Selection** - Add dropdown to categorize postings (Equipment, Services, Jobs, etc.)
2. **Price Field** - Add optional price input for items for sale
3. **Contact Preferences** - Allow users to specify preferred contact method
4. **Multiple Images** - Support uploading multiple images per posting
5. **Draft Saving** - Auto-save drafts to prevent data loss
6. **Preview Mode** - Allow users to preview their post before submitting
