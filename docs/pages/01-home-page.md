# Home Page

## Page Overview

| Property | Value |
|----------|-------|
| Page Name | Home Page |
| Route | `/` or `/home` |
| Purpose | Landing page that introduces Soccer Connect platform, its mission, and core features to visitors |
| Target Users | New visitors, potential users, returning users |

## Page Description

The Home Page serves as the primary landing page for Soccer Connect, a platform designed to connect soccer enthusiasts in the Greater Toronto Area (GTA). The page introduces the platform's mission, highlights key features (Communicate, Organize, Build Up), and provides clear calls-to-action for user registration and login.

---

## UI Components

### 1. Header / Navigation Bar

#### Logo
- **Position**: Top-left corner
- **Element**: Soccer ball icon with geometric design
- **Action**: Click navigates to Home Page

#### Authentication Buttons
- **Position**: Top-right corner
- **Buttons**:
  | Button | Style | Action |
  |--------|-------|--------|
  | Create Account | Cyan/turquoise background, black text, rounded corners | Navigate to registration page |
  | Log in | Cyan/turquoise background, black text, rounded corners | Navigate to login page |

---

### 2. Hero Section

#### Brand Title
- **Text**: "Soccer Connect"
- **Style**: Large, bold, black font
- **Position**: Below navigation, left-aligned

#### Tagline
- **Text**: "A Place to connect and play in the GTA"
- **Style**: Smaller text, italicized
- **Position**: Directly below brand title

---

### 3. Introduction Section

#### Image
- **Content**: Soccer player (wearing jersey #16) performing a kick on a grass field
- **Position**: Left side of introduction content
- **Size**: Medium rectangular image

#### Introduction Text
- **Content**: "Here at Soccer Connect, our goal is to connect the people of the GTA in celebration of our favorite game. With the tools available through our system you can enrich your current experience with the game."
- **Position**: Right side of the image

---

### 4. Feature Sections

#### Feature 1: Communicate
- **Heading**: "Communicate"
- **Description**: "With both single and group messaging systems it's easier to get in contact with your fellow enthusiasts."
- **Position**: Right side, below introduction text

#### Feature 2: Organize
- **Heading**: "Organize"
- **Description**: "Partnering with everyone from the local level to provincial all over the gta you can book Fields to play on for whatever purpose you require."
- **Position**: Left side
- **Associated Image**: Soccer stadium with green field and seating stands (positioned to the right of this section)

#### Feature 3: Build Up
- **Heading**: "Build Up"
- **Description**: "We offer an additional platform for organizations to post job offers. What better place to search for qualified and motivated than among an engaged and informed community."
- **Position**: Right side, below the stadium image

---

### 5. Footer

#### Background
- **Style**: Gray background spanning full width

#### Social Media Links
- **Position**: Left side of footer
- **Icons**:
  | Platform | Icon |
  |----------|------|
  | Twitter | Twitter bird icon |
  | Instagram | Instagram camera icon |
- **Action**: External links to respective social media pages

#### Footer Navigation - Column 1 (About Us)
| Link | Action |
|------|--------|
| About Us | Navigate to About Us page |
| Mission Statement | Navigate to Mission Statement page |
| News | Navigate to News/Updates page |
| Careers | Navigate to Careers page |

#### Footer Navigation - Column 2 (Contact Us)
| Link | Action |
|------|--------|
| Contact Us | Navigate to Contact page |
| Account Help | Navigate to Account Help/FAQ page |
| Contact Form | Navigate to Contact Form page |
| Business Opportunities | Navigate to Business Opportunities page |

---

## Text Content Summary

### Headlines
- "Soccer Connect"
- "Communicate"
- "Organize"
- "Build Up"

### Body Text
1. **Tagline**: "A Place to connect and play in the GTA"
2. **Introduction**: "Here at Soccer Connect, our goal is to connect the people of the GTA in celebration of our favorite game. With the tools available through our system you can enrich your current experience with the game."
3. **Communicate Feature**: "With both single and group messaging systems it's easier to get in contact with your fellow enthusiasts."
4. **Organize Feature**: "Partnering with everyone from the local level to provincial all over the gta you can book Fields to play on for whatever purpose you require."
5. **Build Up Feature**: "We offer an additional platform for organizations to post job offers. What better place to search for qualified and motivated than among an engaged and informed community."

---

## Navigation Elements

### Primary Navigation
| Element | Destination | Notes |
|---------|-------------|-------|
| Logo | `/` | Returns to Home Page |
| Create Account | `/register` or `/signup` | User registration flow |
| Log in | `/login` | User authentication |

### Footer Navigation
| Element | Destination |
|---------|-------------|
| About Us | `/about` |
| Mission Statement | `/mission` |
| News | `/news` |
| Careers | `/careers` |
| Contact Us | `/contact` |
| Account Help | `/help` or `/faq` |
| Contact Form | `/contact-form` |
| Business Opportunities | `/business` |
| Twitter Icon | External: Twitter profile |
| Instagram Icon | External: Instagram profile |

---

## Form Fields

This page does not contain any form fields. Authentication forms are accessed via the "Create Account" and "Log in" buttons.

---

## Suggested API Endpoints

### Required Endpoints

| Endpoint | Method | Purpose | Response |
|----------|--------|---------|----------|
| `GET /api/content/home` | GET | Fetch home page dynamic content (if CMS-driven) | JSON with page sections content |
| `GET /api/auth/status` | GET | Check user authentication status | User session info or null |

### Related Endpoints (Navigation)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `POST /api/auth/login` | POST | User login (from login page) |
| `POST /api/auth/register` | POST | User registration (from signup page) |
| `GET /api/news` | GET | Fetch news articles (for News page) |
| `GET /api/careers` | GET | Fetch career listings (for Careers page) |

---

## Data Requirements

### Static Content
- Brand name and tagline
- Feature descriptions (Communicate, Organize, Build Up)
- Feature images (player image, stadium image)
- Logo image/SVG

### Dynamic Content (Optional)
- Featured news items
- Platform statistics (users, fields booked, etc.)
- Upcoming events preview

### Configuration Data
- Social media URLs (Twitter, Instagram)
- Footer link configurations
- SEO metadata (title, description, keywords)

---

## Responsive Design Considerations

- Header buttons should stack or collapse into hamburger menu on mobile
- Feature sections should stack vertically on smaller screens
- Images should resize appropriately
- Footer columns should stack on mobile devices

---

## Accessibility Requirements

- All images must have descriptive alt text
- Navigation buttons must be keyboard accessible
- Color contrast must meet WCAG standards
- Social media links should have aria-labels

---

## Color Palette (Observed)

| Element | Color |
|---------|-------|
| Background | White (#FFFFFF) |
| Primary Buttons | Cyan/Turquoise (~#00D4FF) |
| Button Text | Black (#000000) |
| Body Text | Black (#000000) |
| Footer Background | Light Gray (~#E0E0E0) |
| Footer Text | Black (#000000) |
