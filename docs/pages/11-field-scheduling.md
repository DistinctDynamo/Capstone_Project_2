# Field Scheduling / Book A Field Page

## Page Overview

**Page Name:** Book A Field (Field Scheduling)

**Purpose:** This page allows users to browse available sports fields and book time slots for their activities. Users can view a specific field's availability by week and day, select desired time slots, and complete a booking reservation.

**URL Route:** `/book-field` or `/fields/:fieldId/schedule`

---

## Page Layout

### Header Section

#### Logo and Branding
- **Soccer Connect Logo:** Soccer ball icon positioned in the top-left corner
- **Brand Name:** "Soccer Connect" displayed prominently below the logo
- **Tagline:** "A Place to connect and play in the GTA"

#### Navigation Buttons (Top Right)
| Button | Action |
|--------|--------|
| Account | Navigates to user account/profile page |
| Log Out | Logs the user out and redirects to home/login page |

#### Main Navigation Menu
| Button | Action |
|--------|--------|
| Team | Navigates to team management/browsing page |
| Classifieds | Navigates to classifieds listings page |
| Events | Navigates to events listing page |

---

## Main Content Section

### Page Title
- **Title:** "Book A Field"
- **Style:** Large, bold heading text

### Field Booking Card

A card component containing all booking interface elements:

#### Field Image
- **Position:** Left side of the card
- **Content:** Thumbnail/preview image of the selected field/facility
- **Size:** Approximately 200x150 pixels
- **Purpose:** Visual representation of the field being booked

#### Field Information
- **Field Name:** Displayed as "Ipsum Lorem" (placeholder for actual field name)
- **Position:** Top-right area of the card, next to the image

#### Week Selection
- **Component:** Dropdown selector
- **Label:** "Week ##" (displays current selected week number)
- **Icon:** Downward-facing triangle/arrow indicating expandable dropdown
- **Functionality:** Allows users to navigate between different weeks to view availability

#### Day Selection (Calendar Navigation)
| Element | Description |
|---------|-------------|
| Day Numbers | Numbers 1-5 (and beyond) representing days of the week |
| Selected Day | Day 4 shown with highlighted border/selection indicator |
| Navigation Arrow | Right-facing arrow to scroll to additional days |
| **Style:** | Numbered buttons in a horizontal row |

#### Time Slot Display
- **Layout:** Vertical list of time slot blocks
- **Visual Indicators:**
  - **Cyan/Turquoise blocks:** Available time slots (bookable)
  - **Gray blocks:** Unavailable/already booked time slots
- **Scrollable:** Vertical scrollbar visible on the right side for additional time slots
- **Quantity Shown:** 4 time slots visible at once (with scroll capability for more)

#### Book Button
- **Label:** "Book"
- **Style:** Cyan/turquoise background with dark text
- **Position:** Below the field image, left side of card
- **Action:** Confirms the selected time slot and proceeds to booking confirmation

### Back Button
- **Label:** "Back"
- **Style:** Orange/yellow background with dark text
- **Position:** Centered below the booking card
- **Action:** Returns user to previous page (field listing or search results)

---

## Footer Section

### Social Media Links
| Icon | Platform | Action |
|------|----------|--------|
| Twitter/X Icon | Twitter | Opens Soccer Connect Twitter page |
| Instagram Icon | Instagram | Opens Soccer Connect Instagram page |

### Footer Navigation Links

#### Column 1 - About
| Link | Destination |
|------|-------------|
| About Us | Company information page |
| Mission Statement | Organization mission page |
| News | News/blog page |
| Careers | Job listings page |

#### Column 2 - Support
| Link | Destination |
|------|-------------|
| Contact Us | Contact information page |
| Account Help | Account support/FAQ page |
| Contact Form | Contact form page |
| Business Opportunities | Business partnership page |

---

## UI Components Summary

### Buttons
1. **Account** - Cyan, rounded corners
2. **Log Out** - Cyan, rounded corners
3. **Team** - Cyan, pill-shaped
4. **Classifieds** - Cyan, rounded corners
5. **Events** - Cyan, rounded corners
6. **Book** - Cyan, rounded corners
7. **Back** - Orange/yellow, rounded corners
8. **Day Selection Buttons** (1-5+) - Square with border
9. **Week Dropdown** - Expandable selector

### Interactive Elements
- Week selection dropdown
- Day number selector (horizontal scrollable)
- Time slot selection (clickable blocks)
- Scrollable time slot list

### Visual Indicators
- Selected day: Border highlight around number
- Available slots: Cyan/turquoise background
- Unavailable slots: Gray background

---

## Suggested API Endpoints

### Field Information
```
GET /api/fields/:fieldId
```
**Response:** Field details including name, location, images, amenities

### Field Availability
```
GET /api/fields/:fieldId/availability
```
**Query Parameters:**
- `weekNumber` - Week number or start date
- `year` - Year for the availability check

**Response:** Array of time slots with availability status for each day

### Create Booking
```
POST /api/bookings
```
**Request Body:**
```json
{
  "fieldId": "string",
  "userId": "string",
  "date": "YYYY-MM-DD",
  "timeSlotId": "string",
  "startTime": "HH:MM",
  "endTime": "HH:MM"
}
```

### Get User Bookings
```
GET /api/users/:userId/bookings
```
**Response:** List of user's current and past bookings

### Cancel Booking
```
DELETE /api/bookings/:bookingId
```
**Response:** Confirmation of booking cancellation

---

## Data Requirements

### Field Entity
| Field | Type | Description |
|-------|------|-------------|
| id | String/UUID | Unique field identifier |
| name | String | Field name |
| location | String | Field address/location |
| imageUrl | String | URL to field image |
| description | String | Field description |
| amenities | Array | List of available amenities |
| hourlyRate | Number | Cost per hour (if applicable) |
| capacity | Number | Maximum players/teams |

### Time Slot Entity
| Field | Type | Description |
|-------|------|-------------|
| id | String/UUID | Unique time slot identifier |
| fieldId | String | Reference to field |
| date | Date | Date of the time slot |
| startTime | Time | Start time of slot |
| endTime | Time | End time of slot |
| isAvailable | Boolean | Availability status |
| price | Number | Price for the slot (optional) |

### Booking Entity
| Field | Type | Description |
|-------|------|-------------|
| id | String/UUID | Unique booking identifier |
| fieldId | String | Reference to booked field |
| userId | String | Reference to user making booking |
| timeSlotId | String | Reference to booked time slot |
| date | Date | Date of booking |
| startTime | Time | Booking start time |
| endTime | Time | Booking end time |
| status | String | Status (confirmed, pending, cancelled) |
| createdAt | DateTime | Booking creation timestamp |
| totalPrice | Number | Total cost of booking |

### Week/Calendar Data
| Field | Type | Description |
|-------|------|-------------|
| weekNumber | Number | Week number (1-52) |
| year | Number | Year |
| startDate | Date | First day of week |
| endDate | Date | Last day of week |
| days | Array | Array of day objects with dates |

---

## User Flow

1. User navigates to "Book A Field" page (via field selection or direct navigation)
2. Field image and name are displayed
3. User selects desired week using dropdown
4. User selects specific day using numbered day buttons
5. Available time slots are displayed (cyan = available, gray = booked)
6. User clicks on desired available time slot to select it
7. User clicks "Book" button to confirm selection
8. System processes booking and redirects to confirmation page
9. User can click "Back" at any time to return to previous page

---

## Accessibility Considerations

- Day selection buttons should have aria-labels indicating full date
- Time slots should have clear visual distinction and aria-labels
- Color indicators (cyan/gray) should be supplemented with text or icons for color-blind users
- Keyboard navigation support for all interactive elements
- Screen reader compatibility for booking status updates

---

## Responsive Design Notes

- On mobile devices, the field image may stack above the calendar/time selection
- Day selector should remain horizontally scrollable
- Time slot list should maintain vertical scroll on smaller screens
- Buttons should maintain minimum touch target size (44x44 pixels)
