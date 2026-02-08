# Logged-in Dashboard Page

## Page Overview

**Page Name:** Dashboard (Logged-in Main Page)

**Purpose:** The dashboard serves as the central hub for authenticated users of Soccer Connect. It provides quick access to all main features of the platform, displays personalized content including news, upcoming events, and recent messages, and enables users to navigate to key functionality such as team management, field booking, classifieds, and events.

**Route:** `/dashboard` or `/home` (authenticated)

---

## Header Section

### Logo
- **Element:** Soccer ball icon with "Soccer Connect" text
- **Tagline:** "A Place to connect and play in the GTA"
- **Action:** Clicking logo returns user to dashboard

### Account Navigation (Top Right)
| Button | Style | Action |
|--------|-------|--------|
| Account | Cyan/turquoise pill button | Navigate to user account settings page |
| Log Out | Cyan/turquoise pill button | End user session and redirect to login page |

---

## Main Navigation Bar

A horizontal navigation bar with four primary action buttons:

| Button | Style | Action |
|--------|-------|--------|
| Team | White pill button with gray border | Navigate to team management page |
| Book a Field | Cyan/turquoise pill button | Navigate to field booking system |
| Classifieds | White pill button with gray border | Navigate to classifieds listings |
| Events | Cyan/turquoise pill button | Navigate to events listing page |

---

## Main Content Area

### News Section

**Container:** Gray rounded card with header bar

**Header:** "News" (dark gray header bar)

**Content Structure:**
- Thumbnail image (left side)
- Article title (bold heading)
- Article excerpt/preview text

**Layout:** Horizontal card layout with image on left, text content on right

**Expected Behavior:**
- Display latest news articles
- Articles should be clickable to view full content
- Support for multiple news items (scrollable or paginated)

---

### Events Widget

**Container:** Gray rounded card

**Header:** "Events" (dark gray header bar)

**Content:** List of upcoming events (placeholder rows shown in design)

**Layout:** Vertical list with event items

**Expected Behavior:**
- Display upcoming events relevant to the user
- Each event item should be clickable to view details
- Show event date, time, and basic info
- May include events the user is registered for or nearby events

---

### Messages Widget

**Container:** Gray rounded card

**Header:** "Messages" (dark gray header bar)

**Content Structure:**
Each message preview includes:
- User avatar (circular placeholder)
- Sender name (User, User 2, Group)
- Message preview text ("Lorem ipsum dolor sit amet...")
- Visual indicator for message type (individual vs group)

**Message Types:**
1. Individual user messages
2. Group messages (shown with chat bubble icon)

**Footer Button:**
- "Messages" button (cyan/turquoise)
- Action: Navigate to full messages/inbox page

**Expected Behavior:**
- Display most recent message conversations
- Show unread indicator if applicable
- Clicking on a message opens the conversation
- Support for both 1:1 and group messaging

---

## Footer Section

### Social Media Links (Left Side)
| Icon | Platform | Action |
|------|----------|--------|
| Twitter/X icon | Twitter | Open Soccer Connect Twitter page |
| Instagram icon | Instagram | Open Soccer Connect Instagram page |

### About Us Column
| Link | Action |
|------|--------|
| Mission Statement | Navigate to mission statement page |
| News | Navigate to news archive page |
| Careers | Navigate to careers/jobs page |

### Contact Us Column
| Link | Action |
|------|--------|
| Account Help | Navigate to account help/FAQ page |
| Contact Form | Navigate to contact form page |
| Business Opportunities | Navigate to business partnerships page |

---

## Suggested API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/logout` | End user session |
| GET | `/api/auth/user` | Get current user info |

### News
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/news` | Get list of news articles |
| GET | `/api/news/:id` | Get single news article details |
| GET | `/api/news/latest` | Get latest news articles for dashboard |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | Get list of all events |
| GET | `/api/events/upcoming` | Get upcoming events for dashboard widget |
| GET | `/api/events/:id` | Get single event details |
| GET | `/api/users/:userId/events` | Get events user is registered for |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages` | Get all user conversations |
| GET | `/api/messages/recent` | Get recent messages for dashboard widget |
| GET | `/api/messages/:conversationId` | Get conversation details |
| GET | `/api/messages/unread/count` | Get unread message count |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/:userId/profile` | Get user profile information |
| PUT | `/api/users/:userId/profile` | Update user profile |

---

## Data Requirements

### User Session Data
```json
{
  "userId": "string",
  "username": "string",
  "email": "string",
  "avatar": "string (URL)",
  "isAuthenticated": true
}
```

### News Article Data
```json
{
  "id": "string",
  "title": "string",
  "excerpt": "string",
  "content": "string",
  "thumbnail": "string (URL)",
  "author": "string",
  "publishedAt": "datetime",
  "category": "string"
}
```

### Event Data
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "date": "datetime",
  "time": "string",
  "location": "string",
  "organizer": "string",
  "maxParticipants": "number",
  "currentParticipants": "number"
}
```

### Message/Conversation Data
```json
{
  "conversationId": "string",
  "type": "individual | group",
  "participants": [
    {
      "userId": "string",
      "username": "string",
      "avatar": "string (URL)"
    }
  ],
  "lastMessage": {
    "content": "string",
    "senderId": "string",
    "timestamp": "datetime"
  },
  "unreadCount": "number"
}
```

---

## UI/UX Notes

### Color Scheme
- **Primary accent:** Cyan/Turquoise (#00BCD4 or similar)
- **Background:** Light gray
- **Cards:** Medium gray with darker gray headers
- **Text:** Dark gray/black on light backgrounds, white on dark headers

### Typography
- **Headers:** Bold, larger font weight
- **Body text:** Regular weight, readable size
- **Navigation:** Medium weight

### Component Styling
- Rounded corners on all buttons and cards
- Pill-shaped buttons for navigation
- Consistent spacing between sections
- Card-based layout for content sections

### Responsive Considerations
- Events and Messages widgets should stack vertically on mobile
- Navigation bar may collapse to hamburger menu on smaller screens
- News section should adapt to single column on mobile

---

## Accessibility Requirements

- All buttons must have proper ARIA labels
- Images must have alt text
- Sufficient color contrast for text readability
- Keyboard navigation support
- Screen reader compatibility for all interactive elements
