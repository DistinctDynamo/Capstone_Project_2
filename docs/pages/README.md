# Soccer Connect - Page Feature Documentation

This directory contains detailed feature documentation for each page/screen in the Soccer Connect application, generated from Figma designs.

## Pages Index

| # | Page | File | Description |
|---|------|------|-------------|
| 01 | Home Page | [01-home-page.md](./01-home-page.md) | Public landing page with app introduction |
| 02 | Sign In | [02-sign-in.md](./02-sign-in.md) | User authentication/login |
| 03 | Account Creation | [03-account-creation.md](./03-account-creation.md) | New user registration |
| 04 | Account Page | [04-account-page.md](./04-account-page.md) | User profile and statistics |
| 05 | Dashboard | [05-dashboard.md](./05-dashboard.md) | Logged-in user main page |
| 06 | Events Listing | [06-events-listing.md](./06-events-listing.md) | View posted events |
| 07 | Events Posting | [07-events-posting.md](./07-events-posting.md) | Create new event |
| 08 | Classifieds Listing | [08-classifieds-listing.md](./08-classifieds-listing.md) | View job/tryout postings |
| 09 | Classifieds Posting | [09-classifieds-posting.md](./09-classifieds-posting.md) | Create job/tryout posting |
| 10 | Field Listings | [10-field-listings.md](./10-field-listings.md) | Browse available fields |
| 11 | Field Scheduling | [11-field-scheduling.md](./11-field-scheduling.md) | Book field time slots |
| 12 | Teams (With Team) | [12-teams-with-team.md](./12-teams-with-team.md) | Team homepage for members |
| 13 | Teams (No Team) | [13-teams-no-team.md](./13-teams-no-team.md) | Team options for non-members |
| 14 | Team Creation | [14-team-creation.md](./14-team-creation.md) | Create a new team |
| 15 | Team Management | [15-team-management.md](./15-team-management.md) | Admin team controls |
| 16 | Player Invite | [16-player-invite.md](./16-player-invite.md) | Invite players to team |
| 17 | Team Search | [17-team-search.md](./17-team-search.md) | Find and apply to teams |
| 18 | Messaging | [18-messaging.md](./18-messaging.md) | Direct and group messaging |

## Page Categories

### Authentication
- [01-home-page.md](./01-home-page.md) - Landing page
- [02-sign-in.md](./02-sign-in.md) - Login
- [03-account-creation.md](./03-account-creation.md) - Registration

### User Profile
- [04-account-page.md](./04-account-page.md) - Profile management
- [05-dashboard.md](./05-dashboard.md) - User dashboard

### Events Module
- [06-events-listing.md](./06-events-listing.md) - List events
- [07-events-posting.md](./07-events-posting.md) - Create event

### Classifieds Module
- [08-classifieds-listing.md](./08-classifieds-listing.md) - List classifieds
- [09-classifieds-posting.md](./09-classifieds-posting.md) - Create classified

### Field Booking Module
- [10-field-listings.md](./10-field-listings.md) - Browse fields
- [11-field-scheduling.md](./11-field-scheduling.md) - Book fields

### Teams Module
- [12-teams-with-team.md](./12-teams-with-team.md) - Team view
- [13-teams-no-team.md](./13-teams-no-team.md) - No team state
- [14-team-creation.md](./14-team-creation.md) - Create team
- [15-team-management.md](./15-team-management.md) - Manage team
- [16-player-invite.md](./16-player-invite.md) - Invite players
- [17-team-search.md](./17-team-search.md) - Find teams

### Communication Module
- [18-messaging.md](./18-messaging.md) - Messaging system

## User Flow

```
┌─────────────────┐
│   Home Page     │
│   (Public)      │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌──────────┐
│Sign In│ │Create    │
│       │ │Account   │
└───┬───┘ └────┬─────┘
    │          │
    └────┬─────┘
         │
         ▼
┌─────────────────┐
│   Dashboard     │
│   (Logged In)   │
└────────┬────────┘
         │
    ┌────┼────┬────────┬─────────┐
    │    │    │        │         │
    ▼    ▼    ▼        ▼         ▼
┌─────┐┌─────┐┌──────┐┌────────┐┌────────┐
│Team ││Field││Events││Classif.││Messages│
│     ││Book │└──────┘└────────┘└────────┘
└──┬──┘└─────┘
   │
   ├── Has Team → Team View → Manage Team
   │                              ├── Invite Players
   │                              └── Edit Team
   └── No Team → Create Team
              └── Find Team → Apply
```

## Document Structure

Each page document follows a consistent structure:

1. **Page Overview** - Name, route, and purpose
2. **UI Components** - Detailed breakdown of visual elements
3. **Form Fields** - Input fields with validation requirements
4. **Buttons & Actions** - All interactive elements
5. **Navigation Elements** - Links and navigation
6. **Footer Content** - Standard footer elements
7. **API Endpoints** - Suggested backend endpoints
8. **Data Requirements** - Data models and schemas
9. **Additional Notes** - Accessibility, responsive design, etc.

---

*Generated from Figma designs for Capstone Project Team 46*
