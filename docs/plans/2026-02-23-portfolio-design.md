# Portfolio Website Design

## Overview

A personal portfolio website that serves as both a printable resume and a project showcase, targeting hiring managers and recruiters. Built with Astro, deployed to GitHub Pages.

## Architecture: Two-Page Split

- `/` — Resume page (experience, education, skills)
- `/projects` — Project showcase (software/web apps)
- Shared layout with nav and footer

## Data Layer

Content managed via YAML data files, validated at build time with Zod schemas.

```
src/
  data/
    resume.yaml          # JSON Resume-inspired schema
  content/
    projects/
      project-one.yaml
      project-two.yaml
```

### resume.yaml structure

- `basics` — name, label/title, email, url, profiles (GitHub, LinkedIn)
- `work` — array of positions (company, title, start/end dates, highlights)
- `education` — array of degrees/certifications
- `skills` — array of skill categories with keywords

### Project YAML structure

- `title`, `description`, `tech` (array), `repo`, `live`, `screenshot`, `featured` (boolean), `order` (number)

## Pages

### Resume Page (`/`)

- Header: name, title, contact links (GitHub, LinkedIn, email)
- Sections flow vertically: Experience > Education > Skills
- Terminal-style section headings (e.g., `$ cat experience`)
- Print button in nav triggers `window.print()`

### Projects Page (`/projects`)

- Grid/list of project cards
- Each card: title, short description, tech tags, repo/live links
- Optional screenshot/thumbnail
- Filterable by tech tag (Astro island with client-side JS)

### Shared Layout

- Minimal nav: site name + Resume / Projects links
- Dark mode default, light mode toggle in nav
- Footer with contact links

## Visual Design

### Typography

- Primary: JetBrains Mono via Google Fonts
- Print: system sans-serif (`system-ui`) for paper readability

### Color Palette — Dark Mode (default)

```css
:root {
  --color-bg: #1E1614;
  --color-surface: #2A201E;
  --color-surface-border: #3D2F2B;
  --color-text: #F0E4DE;
  --color-text-muted: #A89490;
  --color-accent: #E0686E;
  --color-accent-hover: #F07E84;
  --color-accent-subtle: #3A2225;
  --color-code: #2F2220;
}
```

### Color Palette — Light Mode

```css
:root {
  --color-bg: #FDF6F0;
  --color-surface: #FFFFFF;
  --color-surface-border: #F0E0D6;
  --color-text: #3D2C2C;
  --color-text-muted: #8C7272;
  --color-accent: #C4515C;
  --color-accent-hover: #A8404A;
  --color-accent-subtle: #FADBD8;
  --color-code: #F5EBE6;
}
```

### Terminal Aesthetic

- Section headings as terminal commands (`$ cat experience`, `> skills`)
- Blinking cursor on hero/header
- Project cards with faint terminal window frame (title bar dots)
- Warm coral accents give the terminal vibe a unique identity

### Responsive

- Mobile-first, single column on small screens
- Two-column project grid on wider screens

## Print / PDF

CSS `@media print` styles:

- Switches to light mode colors (dark wastes ink)
- Hides nav, theme toggle, print button, footer
- Removes terminal decorations (cursor, command headings become plain)
- Swaps to system sans-serif for paper readability
- Single-column layout sized for A4/Letter
- Page break control to avoid splitting entries

No separate PDF pipeline — browser "Save as PDF" produces a clean document.

## Tech Stack

- **Framework:** Astro (static site generator)
- **Styling:** CSS custom properties with the color palettes above
- **Font:** JetBrains Mono (Google Fonts)
- **Hosting:** GitHub Pages
- **CI/CD:** GitHub Actions (build on push to main, deploy to Pages)

## Decisions

- YAML over JSON for content files (more readable, less noise)
- No JS framework for the resume page (pure Astro/HTML)
- Astro island only for project tag filtering
- Print-first resume design — the web version enhances, print version is the baseline
