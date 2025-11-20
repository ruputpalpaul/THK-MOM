# Design System: Light Mode Analytics Dashboard

**Source:** User Uploaded Design Specifications
**Analysis Date:** 2025-11-20

![Design Reference](file:///C:/Users/rpaul/.gemini/antigravity/brain/fb7799cc-485d-42db-97cf-a6d277976f9d/uploaded_image_1763671299228.png)

## 1. Color Palette

### Primary Colors
**Light Theme:**
-   **Background:** `#FFFFFF` (White)
-   **Surface:** `#F3F3F3` (Light Grey)

**Dark Theme:**
-   **Background:** `#11121E` (Very Dark Blue-Grey)
-   **Surface:** `#1D1D29` (Dark Grey-Blue)

### Secondary Colors (Functional)
-   **Orange:** `#FF8C11`
    -   **Usage:** Warnings, highlights, chart segments.
-   **Blue:** `#4378F9`
    -   **Usage:** Primary actions, links, chart segments.
-   **Green:** `#43B430`
    -   **Usage:** Success states, positive indicators.
-   **Pink/Magenta:** `#CB5EFF`
    -   **Usage:** Accents, special highlights.

### Typography Colors
-   **Primary Text (Light):** `#FFFFFF` (White)
-   **Secondary Text (Light):** `#7B7B7B` (Medium Grey)
-   **Primary Text (Dark):** `#000000` (Black)

## 2. Typography

**Font Family:** **Inter**

### Font Sizes
-   **48px:** Large headings, hero text
-   **36px:** Section headings
-   **20px:** Subheadings, card titles
-   **16px:** Body text, labels
-   **14px:** Small labels, captions

### Font Weights
-   **Semi Bold (600):** Headings, emphasis
-   **Medium (500):** Subheadings, labels
-   **Regular (400):** Body text

## 3. Implementation (Tailwind CSS)

### Color Classes
```css
/* Light Theme */
--background: #FFFFFF;
--surface: #F3F3F3;
--primary: #4378F9;
--success: #43B430;
--warning: #FF8C11;
--accent: #CB5EFF;
--text-primary: #000000;
--text-secondary: #7B7B7B;

/* Dark Theme */
--background-dark: #11121E;
--surface-dark: #1D1D29;
--text-primary-dark: #FFFFFF;
```

### Typography Classes
```css
font-family: 'Inter', sans-serif;

/* Sizes */
.text-hero { font-size: 48px; }
.text-h1 { font-size: 36px; }
.text-h2 { font-size: 20px; }
.text-body { font-size: 16px; }
.text-small { font-size: 14px; }

/* Weights */
.font-semibold { font-weight: 600; }
.font-medium { font-weight: 500; }
.font-regular { font-weight: 400; }
```

## 4. Component Specifications

### Cards
-   **Background:** White (`#FFFFFF`)
-   **Border Radius:** `24px` (very rounded)
-   **Shadow:** Soft, subtle (`0 4px 20px -2px rgba(0, 0, 0, 0.05)`)
-   **Padding:** `24px`

### Buttons
-   **Primary:**
    -   Background: `#4378F9` (Blue)
    -   Text: White
    -   Border Radius: `20px` (pill shape)
    -   Padding: `12px 24px`
-   **Secondary:**
    -   Background: Transparent
    -   Border: `1px solid #4378F9`
    -   Text: `#4378F9`

### Sidebar Navigation
-   **Active Item:**
    -   Background: `#EFF6FF` (Very light blue tint)
    -   Text/Icon: `#4378F9` (Primary blue)
    -   Border Radius: `12px`
-   **Inactive Item:**
    -   Text/Icon: `#7B7B7B` (Grey)
    -   Hover: Light grey background

## 5. Layout Specifications

### Grid System
-   **Container Max Width:** 1440px
-   **Sidebar Width:** 250px - 280px
-   **Grid Gaps:** 24px - 32px
-   **Card Padding:** 24px
-   **Section Spacing:** 32px - 48px

### Responsive Breakpoints
-   **Mobile:** < 768px
-   **Tablet:** 768px - 1024px
-   **Desktop:** > 1024px
