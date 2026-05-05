---
name: LB Motors Core
colors:
  surface: '#f6faff'
  surface-dim: '#d2dbe4'
  surface-bright: '#f6faff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#ecf5fe'
  surface-container: '#e6eff8'
  surface-container-high: '#e0e9f2'
  surface-container-highest: '#dbe4ed'
  on-surface: '#141d23'
  on-surface-variant: '#43474f'
  inverse-surface: '#293138'
  inverse-on-surface: '#e9f2fb'
  outline: '#737780'
  outline-variant: '#c3c6d1'
  surface-tint: '#3a5f94'
  primary: '#001e40'
  on-primary: '#ffffff'
  primary-container: '#003366'
  on-primary-container: '#799dd6'
  inverse-primary: '#a7c8ff'
  secondary: '#5c5f60'
  on-secondary: '#ffffff'
  secondary-container: '#e1e3e4'
  on-secondary-container: '#626566'
  tertiary: '#1b1f21'
  on-tertiary: '#ffffff'
  tertiary-container: '#303436'
  on-tertiary-container: '#999c9f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e3ff'
  primary-fixed-dim: '#a7c8ff'
  on-primary-fixed: '#001b3c'
  on-primary-fixed-variant: '#1f477b'
  secondary-fixed: '#e1e3e4'
  secondary-fixed-dim: '#c5c7c8'
  on-secondary-fixed: '#191c1d'
  on-secondary-fixed-variant: '#454748'
  tertiary-fixed: '#e0e3e6'
  tertiary-fixed-dim: '#c4c7ca'
  on-tertiary-fixed: '#181c1e'
  on-tertiary-fixed-variant: '#43474a'
  background: '#f6faff'
  on-background: '#141d23'
  surface-variant: '#dbe4ed'
typography:
  h1:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  h2:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  h3:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-tabular:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  sidebar-width: 260px
  container-padding: 32px
  gutter: 24px
  card-gap: 20px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style

The design system for LB Motors is built upon a **Corporate Modern** aesthetic, emphasizing precision, reliability, and high-value inventory management. The brand personality is authoritative yet accessible, designed to evoke a sense of trust and institutional stability for dealership staff.

The visual direction prioritizes clarity through a "functional-first" approach. By utilizing a minimalist white and soft gray canvas, the interface allows the high-quality photography of vehicles and critical data points to remain the primary focus. The emotional response is intended to be calm and organized, reducing the cognitive load associated with complex inventory and sales workflows.

## Colors

The palette is anchored by a deep primary Blue, signaling professional heritage and mechanical reliability. This is balanced against an expansive use of "Off-White" and "Soft Gray" layers to create visual separation without the harshness of high-contrast borders.

- **Primary (#003366):** Used for navigation highlights, primary actions, and brand touchpoints.
- **Surface & Backgrounds:** Use #FFFFFF for primary content cards and #F8F9FA for the global application background to create a subtle layered effect.
- **Status Indicators:** Success Green is reserved strictly for 'Sold' or completed transactions. Amber is utilized for 'Available' inventory to draw attention to actionable stock without signaling an error.

## Typography

This design system utilizes a dual-font strategy to balance modernity with utility. **Manrope** is used for headlines to provide a refined, contemporary geometric feel. **Inter** is used for all body copy and UI labels due to its exceptional legibility in data-heavy environments.

Clear hierarchy is established by using a darker ink color for headlines (#1A1D1F) and a slightly softer slate for secondary body text (#4A5056). For vehicle specifications and VIN numbers, the `data-tabular` style ensures numerical clarity.

## Layout & Spacing

The application follows a **Fixed-Fluid hybrid grid**. A fixed left sidebar handles top-level navigation, while the main content area utilizes a fluid container with a maximum width of 1600px to maintain readability on ultra-wide monitors.

A strict 8px spacing scale governs the rhythm. Content cards should have 24px of internal padding to maintain the "Modern & Clean" requirement. Tables should utilize ample vertical whitespace, with a minimum row height of 56px to ensure the interface feels premium and uncrowded.

## Elevation & Depth

This design system uses **Ambient Shadows** and **Tonal Layers** to define depth. Rather than heavy borders, surfaces are distinguished by their elevation levels:

1.  **Level 0 (Background):** #F8F9FA — The base canvas.
2.  **Level 1 (Cards/Sidebar):** #FFFFFF — With a subtle shadow (0px 2px 4px rgba(0,0,0,0.05)) and a 1px border of #E9ECEF.
3.  **Level 2 (Dropdowns/Modals):** #FFFFFF — With a more pronounced diffused shadow (0px 12px 24px rgba(0,0,0,0.1)) to indicate temporary interaction layers.

Transitions between states should be subtle, using opacity shifts rather than dramatic color changes.

## Shapes

The shape language is **Soft** and professional. A base radius of 4px (`0.25rem`) is applied to buttons and input fields to maintain a crisp, business-like appearance. Larger components like content cards and vehicle image containers use a `rounded-lg` (8px) radius to soften the overall layout and provide a modern look.

Avoid fully circular (pill) shapes except for status badges (Sold/Available) to distinguish them from interactive buttons.

## Components

- **Buttons:** Primary buttons use the Dark Blue background with white text. Secondary buttons use a transparent background with a #DEE2E6 border. Transitions involve a subtle background shift to #002244 on hover.
- **Input Fields:** Clean, minimal styling with a #E9ECEF border. On focus, the border transitions to the Primary Blue with a 2px soft glow. Labels should always be visible above the field in `label-sm` style.
- **Cards:** The primary container for vehicle details. Must include a 1px border and the Level 1 shadow. Headers within cards should have a subtle bottom divider.
- **Status Chips:** High-contrast background with white text. 'Sold' uses the Success Green; 'Available' uses the Warning Amber.
- **Data Tables:** Borderless between columns, with a 1px #F1F3F5 divider between rows. The header row should use a light gray background (#F8F9FA) and `label-sm` typography.
- **Vehicle Thumbnails:** Always use an 8px corner radius and a subtle inner border to ensure white car photos don't bleed into white card backgrounds.