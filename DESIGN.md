# Design System: Thorben Woelk CV

This document serves as the single source of truth for the design system of the Thorben Woelk CV website. It provides a structured overview of design tokens and component specifications to ensure aesthetic consistency and ease of maintenance.

## Design Tokens

### Color Palettes
The system supports multiple color schemes, each with a dark and light theme variation.

| Scheme | Primary Color | Primary Color (Light) | Key Vibe |
| :--- | :--- | :--- | :--- |
| **Sand** (Default) | `#c9a87c` | `#a68a5b` | Warm, organic, desert-like |
| **Sage** | `#7a9e7e` | `#5a7e5e` | Calm, natural, leaf-like |
| **Burgundy** | `#a63d40` | `#8a2d30` | Bold, sophisticated, wine-like |
| **Mono** | `#999999` | `#555555` | Minimalist, professional, neutral |
| **Ember** | `#c86b3a` | `#b05a2a` | Energetic, warm, fire-like |

### Global Themes
- **Dark Mode** (Default): `--bg: #0e0e10`, `--text: #e8e6e3`, `--muted: #8a8885`, `--border: rgba(255, 255, 255, 0.08)`
- **Light Mode**: `--bg: #faf8f5`, `--text: #1a1a1a`, `--muted: #6b6966`, `--border: rgba(0, 0, 0, 0.08)`

### Typography
- **Headings**: `Outfit`, system-ui, sans-serif. Used for impact and clarity.
- **Body**: `Inter`, system-ui, sans-serif. Used for readability and modern feel.

#### Type Scale
Uses a fluid `clamp` scale for responsive sizing.
- `--step--1`: `0.84rem` to `0.9rem`
- `--step-0`: `1rem` to `1.15rem` (Base)
- `--step-1`: `1.25rem` to `1.5rem`
- `--step-2`: `1.56rem` to `2rem`
- `--step-3`: `1.95rem` to `2.66rem`
- `--step-4`: `2.44rem` to `3.55rem`

### Layout & Spacing
- **Container Max-Width**: `1200px`
- **Border Radius**: `--radius: 12px`, `--radius-sm: 8px`
- **Navigation Height**: `72px`
- **Shadows**: `--shadow: 0 4px 20px rgba(0, 0, 0, 0.3)` (Dark), `0 4px 20px rgba(0, 0, 0, 0.06)` (Light)

---

## Core Components

### Glass Card
A tactile, elevated container with a subtle background and border.
- **Class**: `.glass-card`
- **Styles**: `background: var(--bg-elev)`, `border: 1px solid var(--border)`, `box-shadow: var(--shadow)`
- **Hover**: `transform: translateY(-2px)`, `border-color: var(--primary)`

### Timeline
A vertical list of items connected by a line and dots.
- **Container**: `.timeline`
- **Item**: `.timeline-item`
- **Date**: `.timeline-date` (Primary color)
- **Dot**: `:before` pseudo-element on `.timeline-item`

### Buttons
Rounded, high-contrast interactive elements.
- **Primary**: `.btn-primary`. Transparent background, text-colored border. Inverts on hover.
- **Default**: `.btn`. Elevated background, subtle border.

---

## Design Philosophy
- **Minimal**: Clear hierarchy and ample white space.
- **Tactile**: Subtle shadows, borders, and hover effects for a physical feel.
- **Accessible**: High contrast, keyboard navigability (skip-link), and reduced motion support.
- **Dynamic**: Fluid typography and responsive layouts that adapt to any device.
