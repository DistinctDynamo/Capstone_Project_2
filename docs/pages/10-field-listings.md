# Book a Field - Listings Page

## Page Overview

**Page Name:** Book a Field (Listings)
**Route:** `/fields` or `/book-a-field`
**Purpose:** Display a scrollable list of available soccer fields that users can browse and select for booking. This page serves as the main discovery interface for field rentals.

---

## UI Components

### 1. Header Section

#### Logo Area
- **Soccer ball icon** - Positioned top-left corner
- **Brand name:** "Soccer Connect" - Large, bold typography
- **Tagline:** "A Place to connect and play in the GTA" - Smaller subtitle text below brand name

#### Account Actions (Top Right)
- **Account Button** - Cyan/turquoise colored pill button
- **Log Out Button** - Cyan/turquoise colored pill button

### 2. Main Navigation Bar

Three navigation buttons displayed horizontally:

| Button | Style | Purpose |
|--------|-------|---------|
| Team | Cyan pill button with rounded corners | Navigate to team management |
| Classifieds | White/light pill button with dark border | Navigate to classifieds section |
| Events | Cyan pill button with rounded corners | Navigate to events page |

### 3. Page Title

- **Text:** "Book A Field"
- **Style:** Large, bold decorative/display font
- **Position:** Left-aligned, below navigation

### 4. Field Listings Container

A gray container holding the scrollable list of field cards with a vertical scrollbar on the right side.

#### Field Card Structure

Each field card contains:

| Element | Description | Position |
|---------|-------------|----------|
| **Field Image** | Thumbnail image of the sports facility | Left side (approximately 40% width) |
| **Field Name** | "Ipsum Lorem" (placeholder) - Bold heading | Right side, top |
| **Description** | Lorem ipsum text describing the field, amenities, and details | Right side, below name |

**Card Layout:**
- Horizontal card layout with image on left, text on right
- Light gray background for each card
- Cards separated by slight spacing
- Full-width within the container

**Visible Cards:** 2 field cards are visible in the viewport

### 5. Footer Section

#### Social Media Icons (Left Side)
- Twitter/X icon
- Instagram icon

#### Footer Links (Center-Right)

Organized in two columns:

**Column 1 - About Us:**
- Mission Statement
- News
- Careers

**Column 2 - Contact Us:**
- Account Help
- Contact Form
- Business Opportunities

**Footer Background:** Gray background matching the listings container

---

## Data Requirements

### Field Object Structure

```typescript
interface Field {
  id: string;
  name: string;
  description: string;
  images: string[];        // Array of image URLs
  thumbnailUrl: string;    // Primary display image
  location: {
    address: string;
    city: string;
    postalCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  amenities: string[];
  capacity: number;
  fieldType: string;       // e.g., "indoor", "outdoor", "turf"
  pricePerHour: number;
  availability: boolean;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### User Session Data

```typescript
interface UserSession {
  isAuthenticated: boolean;
  userId: string;
  username: string;
}
```

---

## Suggested API Endpoints

### Field Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/fields` | Retrieve all available fields |
| `GET` | `/api/fields/:id` | Retrieve a specific field by ID |
| `GET` | `/api/fields?city={city}` | Filter fields by city/location |
| `GET` | `/api/fields?type={type}` | Filter fields by type (indoor/outdoor) |
| `GET` | `/api/fields?available={date}` | Get fields available on specific date |

### Pagination Support

```
GET /api/fields?page=1&limit=10
```

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "fields": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

### Authentication Endpoints (for header actions)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/auth/session` | Get current user session |
| `POST` | `/api/auth/logout` | Log out current user |

---

## User Interactions

### Primary Actions
1. **Browse Fields** - Scroll through the list of available fields
2. **View Field Details** - Click on a field card to see full details and booking options
3. **Navigate** - Use navigation buttons to access other sections

### Secondary Actions
1. **Access Account** - Click Account button for user profile/settings
2. **Log Out** - End current session
3. **Social Links** - Visit social media pages via footer icons
4. **Footer Navigation** - Access informational pages

---

## Responsive Considerations

- Field cards should stack vertically on mobile devices
- Navigation buttons may collapse into hamburger menu on smaller screens
- Footer links should reorganize for mobile viewport
- Images should scale appropriately while maintaining aspect ratio

---

## State Management

### Page States
1. **Loading** - While fetching field data
2. **Loaded** - Fields displayed successfully
3. **Empty** - No fields available (show appropriate message)
4. **Error** - Failed to load fields (show error message with retry option)

### Authentication States
- **Logged In** - Show Account and Log Out buttons
- **Logged Out** - Show Login and Sign Up buttons (button text would change)

---

## Related Pages

- **Field Detail Page** - Accessed when clicking a field card
- **Field Booking Page** - Accessed from field detail to complete booking
- **Team Page** - Linked from navigation
- **Classifieds Page** - Linked from navigation
- **Events Page** - Linked from navigation
- **Account Page** - Linked from header button
