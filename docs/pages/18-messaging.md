# Messaging Page

## Page Overview

**Page Name:** Messages
**Purpose:** The Messaging page provides a centralized communication hub for Soccer Connect users to engage in direct messages with other users and participate in group chats. This feature facilitates team coordination, event planning, and community interaction within the GTA soccer community.

---

## UI Components

### Header Section

| Component | Description |
|-----------|-------------|
| Soccer Ball Logo | Application logo positioned in top-left corner |
| Application Title | "Soccer Connect" with tagline "A Place to connect and play in the GTA" |
| Account Button | Cyan/turquoise button for accessing user account settings |
| Log Out Button | Cyan/turquoise button for logging out of the application |

### Navigation Bar

Primary navigation with four main sections (cyan/turquoise buttons):

| Button | Action |
|--------|--------|
| Team | Navigate to team management page |
| Book a Field | Navigate to field booking page |
| Classifieds | Navigate to classifieds/marketplace page |
| Events | Navigate to events page |

### Page Title

- **"Messages"** - Large heading indicating the current page

### Main Content Area - Split Panel Layout

The messaging interface is divided into two main sections:

#### Left Panel - Chat List

**Header:** "Chats"

**Chat List Items Structure:**
Each chat item contains:
- **Avatar/Profile Picture** - Circular placeholder for user or group image
- **Name** - User name or Group name displayed prominently
- **Message Preview** - Truncated preview of the last message (e.g., "Lorem ipsum dolor sit amet ...")
- **Visual Separator** - Subtle divider between chat entries

**Chat Types Displayed:**
1. Direct Messages (User) - Individual conversations
2. Group Chats (Group) - Multi-participant conversations

**Sample Chat List Order (from image):**
1. User (Direct Message)
2. User 2 (Direct Message)
3. Group (Group Chat)
4. User (Direct Message)
5. Group (Group Chat)

#### Right Panel - Chat Window

**Message Display Area:**
- Gray background container for conversation display
- Messages displayed chronologically

**Message Bubbles:**

| Type | Alignment | Style |
|------|-----------|-------|
| Incoming Messages | Left-aligned | Light gray background, darker text |
| Outgoing Messages | Right-aligned | White/lighter background with border/shadow |

**Message Input Area:**
- Text input field at bottom of chat window
- Send button (cyan arrow/triangle icon) on the right side of input field

---

## Buttons and Actions

### Header Buttons

| Button | Expected Action |
|--------|-----------------|
| Account | Opens account settings/profile page |
| Log Out | Logs user out and redirects to login/home page |

### Navigation Buttons

| Button | Expected Action |
|--------|-----------------|
| Team | Redirects to `/team` page |
| Book a Field | Redirects to `/book-field` page |
| Classifieds | Redirects to `/classifieds` page |
| Events | Redirects to `/events` page |

### Chat Interactions

| Action | Expected Behavior |
|--------|-------------------|
| Click Chat Item | Loads the selected conversation in the right panel |
| Type in Input Field | Composes new message |
| Click Send Button | Sends the composed message to the current conversation |

---

## Chat List Structure

### Direct Messages (1:1 Conversations)

- Display other user's name
- Show profile picture/avatar
- Preview of most recent message
- Timestamp (not visible in wireframe but recommended)
- Unread message indicator (recommended feature)

### Group Chats

- Display group name
- Show group avatar/icon
- Preview of most recent message with sender name (recommended)
- Member count indicator (recommended feature)

---

## Message Display

### Incoming Messages (From Others)

- Positioned on the **left side** of the chat window
- Light gray background
- Contains message text
- Should include: sender name (for groups), timestamp

### Outgoing Messages (From Current User)

- Positioned on the **right side** of the chat window
- White/lighter background with subtle border
- Contains message text
- Should include: timestamp, delivery/read status indicators

---

## Direct Messages vs Group Chats

### Direct Messages

| Feature | Description |
|---------|-------------|
| Participants | 2 users only |
| Display Name | Other user's name/username |
| Avatar | Other user's profile picture |
| Privacy | Private conversation between two users |

### Group Chats

| Feature | Description |
|---------|-------------|
| Participants | 2+ users |
| Display Name | Group name (customizable) |
| Avatar | Group icon or composite of member photos |
| Message Attribution | Each message shows sender's name |
| Admin Features | Group management (add/remove members, rename) |

---

## Navigation Elements

### Primary Navigation (Header Bar)

- Team
- Book a Field
- Classifieds
- Events

### User Navigation (Top Right)

- Account
- Log Out

### Contextual Navigation

- Chat list serves as navigation between conversations
- Back button (recommended for mobile/responsive view)

---

## Footer Content

### Social Media Links

| Platform | Icon | Action |
|----------|------|--------|
| Twitter | Bird icon | Opens Soccer Connect Twitter page |
| Instagram | Camera icon | Opens Soccer Connect Instagram page |

### Footer Links - Column 1 (About Us)

- Mission Statement
- News
- Careers

### Footer Links - Column 2 (Contact Us)

- Account Help
- Contact Form
- Business Opportunities

---

## Suggested API Endpoints

### Conversations/Chats

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/conversations` | Retrieve all conversations for current user |
| GET | `/api/conversations/:id` | Get specific conversation details |
| POST | `/api/conversations` | Create new conversation (DM or Group) |
| DELETE | `/api/conversations/:id` | Delete/leave a conversation |
| PUT | `/api/conversations/:id` | Update conversation (rename group, etc.) |

### Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/conversations/:id/messages` | Get messages for a conversation (with pagination) |
| POST | `/api/conversations/:id/messages` | Send a new message |
| PUT | `/api/messages/:id` | Edit a message |
| DELETE | `/api/messages/:id` | Delete a message |

### Group Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/conversations/:id/members` | Add member to group |
| DELETE | `/api/conversations/:id/members/:userId` | Remove member from group |
| GET | `/api/conversations/:id/members` | Get group members list |

### User Search (for starting new conversations)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/search?q={query}` | Search users to start conversation |

### Real-time (WebSocket)

| Event | Direction | Description |
|-------|-----------|-------------|
| `message:new` | Server to Client | New message received |
| `message:send` | Client to Server | Send new message |
| `conversation:updated` | Server to Client | Conversation metadata updated |
| `user:typing` | Bidirectional | User is typing indicator |

---

## Data Requirements

### Conversation Object

```json
{
  "id": "string",
  "type": "direct" | "group",
  "name": "string (for groups)",
  "participants": ["userId1", "userId2"],
  "lastMessage": {
    "id": "string",
    "content": "string",
    "senderId": "string",
    "timestamp": "ISO8601"
  },
  "unreadCount": "number",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

### Message Object

```json
{
  "id": "string",
  "conversationId": "string",
  "senderId": "string",
  "senderName": "string",
  "content": "string",
  "timestamp": "ISO8601",
  "status": "sent" | "delivered" | "read",
  "attachments": []
}
```

### User Object (for chat display)

```json
{
  "id": "string",
  "username": "string",
  "displayName": "string",
  "avatar": "string (URL)",
  "isOnline": "boolean"
}
```

### Group Object (extended conversation)

```json
{
  "id": "string",
  "name": "string",
  "avatar": "string (URL)",
  "members": [
    {
      "userId": "string",
      "role": "admin" | "member",
      "joinedAt": "ISO8601"
    }
  ],
  "createdBy": "string",
  "createdAt": "ISO8601"
}
```

---

## Additional Recommendations

### Features to Consider

1. **Search Functionality** - Search through chats and messages
2. **Message Status Indicators** - Sent, delivered, read receipts
3. **Typing Indicators** - Show when other users are typing
4. **Online Status** - Display user online/offline status
5. **Push Notifications** - Alert users of new messages
6. **File/Image Sharing** - Ability to share media in chats
7. **Message Reactions** - React to messages with emojis
8. **Reply Threading** - Reply to specific messages
9. **Mute Notifications** - Per-conversation mute option
10. **Block Users** - Ability to block unwanted contacts

### Accessibility Considerations

- Keyboard navigation support for chat list
- Screen reader compatibility for messages
- High contrast mode for message bubbles
- Proper ARIA labels for interactive elements

### Responsive Design Notes

- On mobile: Show chat list or chat window (not both)
- Swipe gestures for navigation between panels
- Collapsible header navigation on smaller screens
