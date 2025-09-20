# SITABIENCE IP Branding Guide

> **Complete Visual Identity & Design System Documentation**

This guide provides comprehensive information about the SITABIENCE IP brand identity, design system, and implementation guidelines for developers and designers working on the platform.

## 🎨 Brand Overview

### Company Identity
- **Company Name**: SITABIENCE IP
- **Tagline**: "Built by Engineers. Trusted by Founders."
- **Industry**: Patent Services & IP Consulting
- **Target Audience**: Startups, Engineers, Founders, IP Professionals
- **Brand Voice**: Professional, Technical, Trustworthy, Innovative

### Brand Promise
"At SITABIENCE, we don't just draft patents — we build IP foundations for future unicorns."

## 🎨 Color Palette

### Primary Colors
```css
/* Primary Green - Used for CTAs, accents, and highlights */
--sitabience-500: #00C060;  /* Main brand green */
--sitabience-600: #00a854;  /* Hover states */
--sitabience-700: #008f47;  /* Active states */
--sitabience-400: #2dd4bf;  /* Light accents */
--sitabience-300: #5eead4;  /* Very light accents */

/* Primary Teal - Used for backgrounds, text, and primary elements */
--teal-500: #004C57;        /* Main brand teal */
--teal-600: #003d46;        /* Darker variants */
--teal-700: #002e35;        /* Darkest variants */
--teal-400: #2dd4bf;        /* Light teal */
--teal-300: #5eead4;        /* Very light teal */
```

### Supporting Colors
```css
/* Neutral Grays */
--gray-50: #F9FAFB;         /* Background */
--gray-100: #F3F4F6;        /* Light borders */
--gray-200: #E5E7EB;        /* Borders */
--gray-300: #D1D5DB;        /* Medium borders */
--gray-400: #9CA3AF;        /* Medium text */
--gray-500: #6B7280;        /* Body text */
--gray-600: #4B5563;        /* Strong text */
--gray-700: #374151;        /* Headings */
--gray-800: #1F2937;        /* Dark text */
--gray-900: #111827;        /* Darkest text */

/* Status Colors */
--success: #00C060;          /* Use sitabience-500 */
--warning: #F59E0B;         /* Yellow for warnings */
--error: #EF4444;           /* Red for errors */
--info: #3B82F6;            /* Blue for information */
```

### Color Usage Guidelines

#### Primary Green (#00C060)
- **Primary buttons** and call-to-action elements
- **Success states** and positive feedback
- **Accent elements** and highlights
- **Interactive elements** that require attention

#### Primary Teal (#004C57)
- **Backgrounds** for major sections
- **Primary text** for headings and important content
- **Navigation elements** and primary UI components
- **Footer and header** backgrounds

#### Supporting Colors
- **Gray scale** for body text, borders, and neutral elements
- **Status colors** for specific feedback and states
- **Accent colors** sparingly for variety and emphasis

## 🔤 Typography

### Font Family
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Font Weights
- **Regular (400)**: Body text, descriptions
- **Medium (500)**: Labels, secondary text
- **Semibold (600)**: Subheadings, emphasis
- **Bold (700)**: Headings, important text

### Type Scale
```css
/* Headings */
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }    /* H1 */
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }  /* H2 */
.text-2xl { font-size: 1.5rem; line-height: 2rem; }       /* H3 */
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }    /* H4 */

/* Body Text */
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }   /* Large body */
.text-base { font-size: 1rem; line-height: 1.5rem; }      /* Regular body */
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }   /* Small text */
.text-xs { font-size: 0.75rem; line-height: 1rem; }       /* Captions */
```

### Typography Guidelines
- **Headings**: Use teal-800 (#1F2937) for primary headings
- **Body Text**: Use gray-700 (#374151) for main content
- **Secondary Text**: Use gray-600 (#4B5563) for less important content
- **Muted Text**: Use gray-500 (#6B7280) for captions and metadata

## 🧩 Component System

### Buttons

#### Primary Button
```css
.btn-primary {
  @apply bg-sitabience-500 hover:bg-sitabience-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sitabience-400 focus:ring-offset-2 shadow-sm hover:shadow-md;
}
```

#### Secondary Button
```css
.btn-secondary {
  @apply bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 shadow-sm hover:shadow-md;
}
```

#### Outline Button
```css
.btn-outline {
  @apply border-2 border-sitabience-500 text-sitabience-500 hover:bg-sitabience-500 hover:text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sitabience-400 focus:ring-offset-2;
}
```

### Form Elements

#### Input Fields
```css
.input-field {
  @apply w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sitabience-400 focus:border-sitabience-500 transition-all duration-200 bg-white;
}
```

#### Labels
```css
.label {
  @apply block text-sm font-semibold text-teal-800 mb-2;
}

.label-required::after {
  content: ' *';
  @apply text-sitabience-500;
}
```

### Cards and Sections

#### Form Section
```css
.form-section {
  @apply bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-8;
}

.form-section-title {
  @apply text-xl font-bold text-teal-800 mb-6 pb-3 border-b-2 border-sitabience-200;
}
```

#### Card Component
```css
.card {
  @apply bg-white rounded-xl shadow-lg border border-gray-100 p-8;
}

.card-header {
  @apply border-b-2 border-sitabience-100 pb-4 mb-6;
}

.card-title {
  @apply text-2xl font-bold text-teal-800;
}
```

### Status Badges

#### Status Badge Base
```css
.status-badge {
  @apply inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold;
}
```

#### Status Variants
```css
.status-pending {
  @apply bg-yellow-100 text-yellow-800 border border-yellow-200;
}

.status-completed {
  @apply bg-sitabience-100 text-sitabience-800 border border-sitabience-200;
}

.status-draft {
  @apply bg-teal-100 text-teal-800 border border-teal-200;
}

.status-expired {
  @apply bg-red-100 text-red-800 border border-red-200;
}
```

## 🎭 Visual Elements

### Gradients

#### Primary Gradient
```css
.gradient-bg {
  background: linear-gradient(135deg, #004C57 0%, #00C060 100%);
}
```

#### Teal Gradient
```css
.gradient-bg-teal {
  background: linear-gradient(135deg, #004C57 0%, #2dd4bf 100%);
}
```

### Shadows

#### Glow Effects
```css
.shadow-glow {
  box-shadow: 0 0 30px rgba(0, 192, 96, 0.2);
}

.shadow-glow-teal {
  box-shadow: 0 0 30px rgba(0, 76, 87, 0.2);
}
```

### Text Gradients

#### Primary Text Gradient
```css
.text-gradient {
  @apply bg-gradient-to-r from-teal-600 to-sitabience-500 bg-clip-text text-transparent;
}
```

#### Teal Text Gradient
```css
.text-gradient-teal {
  @apply bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent;
}
```

## 📧 Email Template System

### Base Template Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SITABIENCE IP - Patent Services</title>
    <style>
        /* Brand Colors */
        :root {
            --sitabience-green: #00C060;
            --sitabience-teal: #004C57;
            --sitabience-white: #FFFFFF;
            --sitabience-gray: #6B7280;
        }
        
        /* Typography */
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #374151;
        }
        
        /* Header */
        .header {
            background: linear-gradient(135deg, var(--sitabience-teal) 0%, var(--sitabience-green) 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        /* Content */
        .content {
            padding: 40px 30px;
        }
        
        /* Footer */
        .footer {
            background: var(--sitabience-teal);
            color: white;
            padding: 30px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">SITABIENCE IP</div>
            <div class="tagline">Built by Engineers. Trusted by Founders.</div>
            <div class="subtitle">Patent Services & IP Consulting</div>
        </div>
        
        <div class="content">
            <!-- Email content goes here -->
        </div>
        
        <div class="footer">
            <!-- Footer content -->
        </div>
    </div>
</body>
</html>
```

### Email Template Types

#### 1. Patent Application Invitation
- **Purpose**: Invite clients to submit patent applications
- **Key Elements**: Company introduction, value proposition, clear CTA
- **Branding**: Full SITABIENCE IP visual identity

#### 2. Form Submission Confirmation
- **Purpose**: Confirm receipt of patent application
- **Key Elements**: Submission details, next steps, contact information
- **Branding**: Professional confirmation with company expertise

#### 3. Status Update Notifications
- **Purpose**: Communicate patent application progress
- **Key Elements**: Current status, next steps, timeline
- **Branding**: Consistent with company communication standards

#### 4. Newsletter Communications
- **Purpose**: Share IP insights and company updates
- **Key Elements**: Industry news, company expertise, thought leadership
- **Branding**: Professional presentation of company knowledge

## 📱 Responsive Design

### Breakpoint System
```css
/* Mobile First Approach */
/* Base styles for mobile (320px+) */

/* Small tablets and up */
@media (min-width: 640px) {
  /* sm: styles */
}

/* Medium tablets and up */
@media (min-width: 768px) {
  /* md: styles */
}

/* Large tablets and up */
@media (min-width: 1024px) {
  /* lg: styles */
}

/* Desktop and up */
@media (min-width: 1280px) {
  /* xl: styles */
}
```

### Mobile Considerations
- **Touch Targets**: Minimum 44px × 44px for interactive elements
- **Typography**: Ensure readability on small screens
- **Navigation**: Collapsible navigation for mobile devices
- **Forms**: Optimized input fields for mobile keyboards

## 🎯 Implementation Guidelines

### Frontend Development

#### 1. Use Design System Classes
```jsx
// ✅ Correct - Using design system classes
<button className="btn-primary">
  Submit Application
</button>

// ❌ Incorrect - Custom styling
<button className="bg-green-500 text-white px-4 py-2 rounded">
  Submit Application
</button>
```

#### 2. Consistent Spacing
```jsx
// ✅ Correct - Using consistent spacing scale
<div className="space-y-6">  {/* 24px spacing */}
  <div className="p-6">      {/* 24px padding */}
    <h2 className="mb-4">    {/* 16px margin bottom */}
      Title
    </h2>
  </div>
</div>
```

#### 3. Brand Color Usage
```jsx
// ✅ Correct - Using brand colors
<div className="text-teal-800">     {/* Primary text */}
<div className="text-sitabience-500"> {/* Accent text */}
<div className="bg-teal-50">         {/* Light backgrounds */}

// ❌ Incorrect - Using arbitrary colors
<div className="text-blue-600">
<div className="bg-purple-100">
```

### Backend Development

#### 1. Email Template Consistency
```javascript
// ✅ Correct - Using branded email templates
const emailContent = getPatentInvitationTemplate(adminName, clientEmail, formLink);

// ❌ Incorrect - Plain text emails
const emailContent = `Hello, please submit your application at ${formLink}`;
```

#### 2. Brand Messaging
```javascript
// ✅ Correct - Using company taglines and messaging
const subject = 'Patent Application Invitation - SITABIENCE IP';
const companyName = 'SITABIENCE IP';

// ❌ Incorrect - Generic messaging
const subject = 'Form Invitation';
const companyName = 'Our Company';
```

## 🔍 Quality Assurance

### Design Review Checklist
- [ ] **Colors**: Using correct brand color palette
- [ ] **Typography**: Consistent font usage and hierarchy
- [ ] **Spacing**: Following design system spacing scale
- [ ] **Components**: Using established component patterns
- [ ] **Responsiveness**: Mobile-first design approach
- [ ] **Accessibility**: High contrast and readable text
- [ ] **Branding**: Consistent SITABIENCE IP identity

### Code Review Checklist
- [ ] **CSS Classes**: Using design system classes
- [ ] **Color Values**: Using brand color variables
- [ ] **Component Props**: Following established patterns
- [ ] **Responsive Design**: Mobile-first implementation
- [ ] **Accessibility**: ARIA labels and semantic HTML
- [ ] **Performance**: Optimized rendering and loading

## 📚 Resources

### Design Files
- **Figma Design System**: [Link to Figma file]
- **Brand Assets**: [Link to asset library]
- **Icon Library**: [Link to icon set]

### Development Resources
- **Component Library**: [Link to Storybook]
- **Design Tokens**: [Link to design tokens]
- **Style Guide**: [Link to style guide]

### Brand Guidelines
- **Logo Usage**: [Link to logo guidelines]
- **Color Palette**: [Link to color guide]
- **Typography**: [Link to type guide]

## 🤝 Support & Questions

### Design Team Contact
- **Lead Designer**: [Name and contact]
- **UI/UX Team**: [Team contact information]
- **Brand Manager**: [Brand contact information]

### Development Team Contact
- **Frontend Lead**: [Name and contact]
- **Backend Lead**: [Name and contact]
- **Technical Lead**: [Name and contact]

---

**This branding guide is a living document and should be updated as the brand evolves.**

*Last updated: January 2025*
*Version: 1.0*
