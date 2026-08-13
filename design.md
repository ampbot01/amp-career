# AMP Design System — Job Portal (amp-career)

> Extracted from `ampedmedia.id` live site (Aug 2026).
> Target: Next.js full-stack job portal (applicant-facing + admin dashboard).

---

## 1. Brand Identity

| Atribut | Value |
|---------|-------|
| Brand | **AMP** (Amped Media) |
| Tagline | "Bespoke Creative Teams, Powered by AI" |
| TLD | ampedmedia.id |
| Tone | Modern, premium, tech-forward, dark-first |

---

## 2. Color Palette

### 2.1 Surface & Background

```
--background: hsl(0, 0%, 1.2%)       ≈ #030303   → main page bg
--card:      hsl(0, 0%, 3.9%)        ≈ #0a0a0a   → card / section bg
--popover:   hsl(0, 0%, 3.9%)                    → dropdown / modal bg

Solid layers:
  #050505 / #080808 / #0a0a0a         → stacked depth layers
  #111 / #171717                       → elevated surfaces, hover states
```

### 2.2 Borders

```
--border: hsl(0, 0%, 14.9%)          ≈ #262626
--input:  hsl(0, 0%, 14.9%)

Utility:
  border-white/10    → #ffffff1a      → default card border
  border-white/[0.08]                 → subtle divider
  border-neutral-700 → #404040        → interactive borders
```

### 2.3 Primary — Blue (#2266F1)

Blue is THE brand color. Used for CTAs, links, active states, gradients.

```
Main:      #2266F1     → buttons, primary actions
Hover:     #2563eb     → button hover
Deep:      #1d4ed8     → gradient end, pressed
Light:     #3b82f6     → glow, secondary text
Soft:      #60a5fa     → highlight text
Blue-300:  #93c5fd     → subtle blue text
```

### 2.4 Accent — Purple / Fuchsia / Teal

```
Purple:
  #8350e8   → gradient color (sparkles)
  #a855f7   → accent elements
  #8b5cf6   → fitur badge
  #a78bfa   → muted accent text

Fuchsia:
  #d946ef   → secondary gradient
  #e879f9   → soft fuchsia border

Teal:
  #2dd4bf   → alternate accent

Green:
  #22c55e   → status success / active
```

### 2.5 Text

```
--foreground:         hsl(0, 0%, 98%)   → primary text (≈ white)
--muted-foreground:   hsl(0, 0%, 63.9%) → secondary text
--secondary-foreground: hsl(0, 0%, 98%)
--card-foreground:    hsl(0, 0%, 98%)

Solid:
  #fff / white          → headings
  #9ca3af               → muted body text
```

### 2.6 Gradients (Critical for visual identity)

| Name | CSS |
|------|-----|
| **Hero glow** | `radial-gradient(ellipse 80% 50% at 50% -10%, rgba(34,102,241,0.18), transparent 55%)` |
| **CTA button** | `linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)` |
| **Blue spot** | `radial-gradient(circle at center, rgba(59,130,246,0.35), transparent 60%)` |
| **Subtle grid** | `linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px)` + `linear-gradient(to bottom, ...)` — size 48px |
| **Purple sparkle** | `radial-gradient(circle at bottom center, #8350e8, transparent 70%)` |
| **Header ambient** | `radial-gradient(ellipse 80% 60% at 20% 0%, rgba(255,255,255,0.08) 0%, transparent 55%)` |
| **Glass** | `background: rgba(255,255,255,0.03–0.05)` + `backdrop-blur` + `border-white/10` |

---

## 3. Typography

### Font Stack

```css
/* Headings */
font-family: 'Space Grotesk', sans-serif;
font-weight: 300, 400, 500, 600, 700;

/* Body */
font-family: 'Inter', sans-serif;
font-weight: 300, 400, 500, 600, 700;
```

### Implementation (from live site)

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
```

### Tailwind Config Suggestion

```js
// tailwind.config.js
fontFamily: {
  heading: ['Space Grotesk', 'sans-serif'],
  body: ['Inter', 'sans-serif'],
}
```

---

## 4. Brand Mark (Favicon / Logo)

- File: `/assets/favicon-C9jQ9RaK.svg`
- Original viewBox: `0 0 3656 1035` — wide horizontal logo (likely "AMP" lettering with creative flair)
- SVG contains complex path data — not a simple icon

---

## 5. Component Style Patterns

### 5.1 Buttons

| State | Style |
|-------|-------|
| **Primary CTA** | Gradient `#3b82f6 → #2563eb → #1d4ed8`, white text, hover glow |
| **Ghost** | `bg-transparent`, `border-white/10`, hover `bg-white/10` |
| **Glow button** | Class `.glow-btn` — animated glow effect pake pseudo-element + border transparan |

### 5.2 Cards

```
bg-card (≈ #0a0a0a)
border-white/10 (≈ rgba(255,255,255,0.1))
rounded-xl / rounded-2xl
```

### 5.3 Input Fields

```
bg-transparent
border border-input (≈ hsl(0 0% 14.9%))
rounded-md (calc(var(--radius) - 2px))
placeholder: text-neutral-400
focus-visible: ring-white/30 + ring-offset-2
```

### 5.4 Dividers / Separators

```
border-white/[0.08]     → subtle
border-white/10         → standard
border-white/20         → prominent
```

### 5.5 Badges

```
bg-blue-500/10 text-blue-300     → info
bg-purple-500/10 text-violet-400 → feature
bg-green-500/10 text-teal-400    → success
bg-red-500/10 text-red-400       → error / urgent
border accent per type
```

---

## 6. Layout Principles

- **Dark-first**: `class="dark"` forced on `<html>`, no light mode toggle
- **Full-width sections** with max-width containers
- **Grid background** 48px (`rgba(255,255,255,0.07)` lines) for hero/special sections
- **Glow effects** dari gradient spot di atas section
- **Subtle glass**: transparan + blur untuk floating elements
- **Muted scrollbar**: custom `#222 / #333` thumb

---

## 7. Radius System

```
--radius (Tailwind variable)       → base
rounded-md: calc(var(--radius) - 2px)
rounded-lg: var(--radius)
rounded-xl: 0.75rem  (12px)
rounded-2xl: 1rem    (16px)
rounded-3xl: 1.5rem  (24px)
rounded-[1.15rem] / [2rem]
rounded-full: 9999px               → pills / avatars
```

---

## 8. Job Portal-Specific Extensions

Di atas foundation AMP, tambah:

### 8.1 Additional Status Colors

```css
--warning: #f59e0b      /* amber — pending review */
--info:    #2266F1      /* blue — match brand primary */
```

### 8.2 Dashboard Layout

- Sidebar: `#080808` bg, `border-white/[0.08]` divider
- Content area: `--background` (`#030303`)
- Data tables: card bg alternates `bg-card` / `bg-black/20`
- Table headers: `text-muted-foreground` (`#9ca3af`)
- Pagination: ghost-style buttons

### 8.3 Job Card Specs

```
bg-card (#0a0a0a)
border-white/10
rounded-xl
Space Grotesk for title (font-semibold)
Inter for body description
Blue badge (#2266F1/[bg-2266F1]) for "active"
Gray badge for "closed"
```

### 8.4 Form Specs

```
Labels: text-sm text-muted-foreground
Input: bg-transparent + border border-input
Focus: ring-white/30
Error: border-red-500/30 + red-400 helper text
Submit: full-width gradient CTA button
```

---

## 9. Tailwind Config Reference

```js
// tailwind.config.js
export default {
  darkMode: 'class', // forced: <html class="dark">
  theme: {
    extend: {
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        amp: {
          blue: '#2266F1',
          'blue-light': '#3b82f6',
          'blue-deep': '#1d4ed8',
          purple: '#8350e8',
          bg: '#030303',
          card: '#0a0a0a',
          surface: '#111',
          border: '#262626',
          muted: '#9ca3af',
        },
      },
      backgroundImage: {
        'hero-glow':
          'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(34,102,241,0.18), transparent 55%)',
        'btn-gradient':
          'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
        'grid-pattern':
          'linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.07) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '48px 48px',
      },
    },
  },
};
```