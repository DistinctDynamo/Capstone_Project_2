# Team Creation Page

## Page Overview

**Page Name:** Team Creation
**Route:** `/team/create` (suggested)
**Purpose:** Allows authenticated users to create a new team within the Soccer Connect platform. Users can upload a team logo, provide a team name, and add a description to establish their team identity.

**Access Requirements:** User must be logged in to access this page.

---

## UI Components

### Header Section

#### Logo and Branding
- **Soccer ball icon** - Positioned in the top-left corner, serves as the site logo
- **Site title:** "Soccer Connect"
- **Tagline:** "A Place to connect and play in the GTA"

#### User Account Controls (Top Right)
| Button | Action |
|--------|--------|
| Account | Navigates to user account/profile page |
| Log Out | Logs the user out of the system and redirects to home/login page |

### Navigation Bar

Horizontal navigation menu with cyan/turquoise styled buttons:

| Navigation Item | Description |
|-----------------|-------------|
| Team | Navigate to team-related pages (team listing, team management) |
| Book a Field | Navigate to field booking functionality |
| Classifieds | Navigate to classifieds/marketplace section |
| Events | Navigate to events listing and management |

---

## Main Content Section

### Page Title
- **"Team Creation"** - Large heading indicating the current page function

### Logo Upload Section

#### Image Preview Area
- **Component:** Image placeholder/preview container
- **Dimensions:** Approximately 300x200px (rectangular)
- **Default State:** Gray placeholder with mountain/landscape icon indicating image upload area
- **After Upload:** Displays the uploaded team logo image

#### Upload Logo Button
- **Button Text:** "Upload Logo"
- **Button Style:** Cyan/turquoise background with dark text
- **Action:** Opens file picker dialog to select an image file

### Team Information Form

#### Team Name Field
- **Label:** "Team Name"
- **Input Type:** Text input field
- **Placeholder:** "Name"
- **Width:** Medium width, centered on page

#### Description Field
- **Label:** "Description"
- **Input Type:** Text input field (potentially textarea for longer content)
- **Placeholder:** "Description"
- **Width:** Medium width, centered on page

### Form Submission

#### Create Team Button
- **Button Text:** "Create Team"
- **Button Style:** Cyan/turquoise background with dark text, prominent size
- **Action:** Submits the form to create a new team

---

## Form Fields and Validation Requirements

### Team Name
| Property | Requirement |
|----------|-------------|
| Required | Yes |
| Min Length | 2 characters |
| Max Length | 50 characters |
| Allowed Characters | Letters, numbers, spaces, hyphens |
| Unique | Must be unique across all teams |
| Validation Messages | "Team name is required", "Team name must be at least 2 characters", "Team name already exists" |

### Description
| Property | Requirement |
|----------|-------------|
| Required | No (optional) |
| Min Length | N/A |
| Max Length | 500 characters |
| Allowed Characters | Any text |
| Validation Messages | "Description must be less than 500 characters" |

### Logo Upload
| Property | Requirement |
|----------|-------------|
| Required | No (optional) |
| Accepted Formats | JPEG, PNG, GIF, WebP |
| Max File Size | 5MB |
| Recommended Dimensions | 400x400px (square for best display) |
| Validation Messages | "Invalid file format", "File size exceeds 5MB limit" |

---

## Logo Upload Functionality

### File Selection Process
1. User clicks "Upload Logo" button
2. Native file picker dialog opens
3. User selects an image file
4. File is validated for format and size
5. Preview is displayed in the image container
6. File is prepared for upload on form submission

### Technical Implementation
- **Client-side preview:** Use FileReader API to display image preview before upload
- **Upload method:** Multipart form data or pre-signed URL upload
- **Storage:** Cloud storage (S3, Cloudinary, or similar)
- **Optimization:** Server-side image resizing and optimization

---

## Footer Section

### Social Media Links (Left Side)
| Icon | Platform | Action |
|------|----------|--------|
| Twitter/X icon | Twitter | Opens Soccer Connect Twitter page in new tab |
| Instagram icon | Instagram | Opens Soccer Connect Instagram page in new tab |

### Footer Navigation Links

#### Column 1 - About
| Link | Destination |
|------|-------------|
| About Us | /about |
| Mission Statement | /mission |
| News | /news |
| Careers | /careers |

#### Column 2 - Support
| Link | Destination |
|------|-------------|
| Contact Us | /contact |
| Account Help | /help/account |
| Contact Form | /contact-form |
| Business Opportunities | /business |

---

## Suggested API Endpoints

### Team Creation

#### POST /api/teams
**Purpose:** Create a new team

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "logoUrl": "string (optional)"
}
```

**Response (201 Created):**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "logoUrl": "string",
  "createdBy": "userId",
  "createdAt": "timestamp",
  "members": []
}
```

**Error Responses:**
- 400 Bad Request - Validation errors
- 401 Unauthorized - User not authenticated
- 409 Conflict - Team name already exists

---

### Logo Upload

#### POST /api/upload/team-logo
**Purpose:** Upload team logo image

**Request:** Multipart form data with image file

**Response (200 OK):**
```json
{
  "url": "string",
  "filename": "string",
  "size": "number"
}
```

**Error Responses:**
- 400 Bad Request - Invalid file format or size
- 401 Unauthorized - User not authenticated

---

### Team Name Validation

#### GET /api/teams/check-name?name={teamName}
**Purpose:** Check if team name is available

**Response (200 OK):**
```json
{
  "available": "boolean",
  "message": "string"
}
```

---

## Data Requirements

### Team Entity Schema

```javascript
{
  id: ObjectId,              // Unique identifier
  name: String,              // Team name (required, unique)
  description: String,       // Team description (optional)
  logoUrl: String,           // URL to team logo image (optional)
  createdBy: ObjectId,       // Reference to User who created the team
  createdAt: Date,           // Timestamp of creation
  updatedAt: Date,           // Timestamp of last update
  members: [{                // Array of team members
    userId: ObjectId,
    role: String,            // 'owner', 'admin', 'member'
    joinedAt: Date
  }],
  status: String             // 'active', 'inactive', 'suspended'
}
```

### Required Database Indexes
- `name` - Unique index for team name lookups
- `createdBy` - Index for finding teams by creator
- `members.userId` - Index for finding teams by member

### Relationships
- **User -> Team:** One-to-Many (a user can create multiple teams)
- **Team -> User:** Many-to-Many (a team has multiple members)

---

## User Flow

1. User navigates to Team Creation page (must be authenticated)
2. User optionally uploads a team logo
3. User enters team name (required)
4. User enters team description (optional)
5. User clicks "Create Team" button
6. System validates all inputs
7. If validation passes:
   - Logo is uploaded to storage (if provided)
   - Team is created in database
   - User is added as team owner
   - User is redirected to team dashboard/profile
8. If validation fails:
   - Error messages are displayed
   - User corrects errors and resubmits

---

## Design Specifications

### Color Palette
| Element | Color |
|---------|-------|
| Primary buttons | Cyan/Turquoise (#00D4D4 or similar) |
| Button text | Dark gray/black |
| Page background | White |
| Footer background | Gray (#808080 or similar) |
| Footer text | White |
| Input borders | Light gray |

### Typography
- Page title: Large, bold, serif font
- Section labels: Medium, bold, serif font
- Button text: Medium, sans-serif font
- Form placeholders: Regular, gray text

### Button Styling
- Rounded corners (border-radius: 20px approximately)
- Consistent padding
- Hover states for interactivity

---

## Accessibility Considerations

- All form fields must have associated labels
- Upload button should indicate accepted file types
- Error messages should be announced to screen readers
- Sufficient color contrast for text and buttons
- Keyboard navigation support for all interactive elements
- Alt text for uploaded logo preview
