# Portfolio Website Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a two-page Astro portfolio site (resume + projects) with terminal aesthetic, dark/light theme, and print-friendly resume output, deployed to GitHub Pages.

**Architecture:** Astro static site with YAML data files driving both pages. Content collections with Zod validation for projects. CSS custom properties for theming. No JS frameworks — pure Astro components with one island for project filtering.

**Tech Stack:** Astro 5, CSS custom properties, JetBrains Mono (Google Fonts), GitHub Actions, GitHub Pages

---

### Task 1: Scaffold Astro Project

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json` (via CLI)

**Step 1: Initialize Astro project**

Run: `npm create astro@latest . -- --template minimal --no-install --no-git --typescript strict`

This scaffolds into the current directory with minimal template.

**Step 2: Install dependencies**

Run: `npm install`

**Step 3: Configure Astro for GitHub Pages**

Edit `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://laura-naccarato.github.io',
  base: '/laura-naccarato-profile',
});
```

> Note: Update the `site` and `base` values to match the actual GitHub username and repo name.

**Step 4: Verify build works**

Run: `npm run build`
Expected: Build completes successfully, `dist/` directory created.

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro project with minimal template"
```

---

### Task 2: Create Resume Data File

**Files:**
- Create: `src/data/resume.yaml`

**Step 1: Create the resume YAML data file**

Create `src/data/resume.yaml` with JSON Resume-inspired structure:

```yaml
basics:
  name: "Laura Naccarato"
  label: "Software Developer"
  email: "email@example.com"
  url: "https://laura-naccarato.github.io"
  profiles:
    - network: "GitHub"
      url: "https://github.com/laura-naccarato"
    - network: "LinkedIn"
      url: "https://linkedin.com/in/laura-naccarato"

work:
  - company: "Example Corp"
    position: "Software Developer"
    startDate: "2024-01"
    endDate: ""
    highlights:
      - "Built and maintained web applications"
      - "Collaborated with cross-functional teams"

education:
  - institution: "University"
    area: "Computer Science"
    studyType: "Bachelor"
    startDate: "2020"
    endDate: "2024"

skills:
  - name: "Languages"
    keywords:
      - "TypeScript"
      - "JavaScript"
      - "Python"
  - name: "Frameworks"
    keywords:
      - "React"
      - "Astro"
  - name: "Tools"
    keywords:
      - "Git"
      - "Docker"
```

> Note: This is placeholder data. The user will fill in real content later.

**Step 2: Commit**

```bash
git add src/data/resume.yaml
git commit -m "feat: add resume data file with placeholder content"
```

---

### Task 3: Create Project Content Collection

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/projects/example-project.yaml`

**Step 1: Create the content config with Zod schema**

Create `src/content.config.ts`:

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tech: z.array(z.string()),
    repo: z.string().url().optional(),
    live: z.string().url().optional(),
    screenshot: z.string().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(0),
  }),
});

export const collections = { projects };
```

**Step 2: Create an example project entry**

Create `src/content/projects/example-project.yaml`:

```yaml
title: "Example Project"
description: "A sample project to demonstrate the portfolio layout. Replace this with a real project."
tech:
  - "TypeScript"
  - "Astro"
repo: "https://github.com/laura-naccarato/example"
featured: true
order: 1
```

**Step 3: Verify build still works**

Run: `npm run build`
Expected: Build succeeds, content collection is validated.

**Step 4: Commit**

```bash
git add src/content.config.ts src/content/projects/example-project.yaml
git commit -m "feat: add projects content collection with Zod schema"
```

---

### Task 4: Global Styles and Theme System

**Files:**
- Create: `src/styles/global.css`

**Step 1: Create global stylesheet with CSS custom properties**

Create `src/styles/global.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');

/* Dark mode (default) */
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

/* Light mode */
:root.light {
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

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-family: 'JetBrains Mono', monospace;
  background-color: var(--color-bg);
  color: var(--color-text);
  line-height: 1.6;
}

body {
  max-width: 48rem;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

a {
  color: var(--color-accent);
  text-decoration: none;
}

a:hover,
a:focus {
  color: var(--color-accent-hover);
  text-decoration: underline;
}

/* Terminal-style section headings */
.section-heading {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-accent);
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-surface-border);
}

.section-heading::before {
  content: '$ ';
  color: var(--color-text-muted);
}
```

**Step 2: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add global styles with dark/light theme custom properties"
```

---

### Task 5: Base Layout and Theme Toggle

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/ThemeToggle.astro`
- Create: `src/components/Nav.astro`
- Create: `src/components/Footer.astro`

**Step 1: Create the ThemeToggle component**

Create `src/components/ThemeToggle.astro`:

```astro
---
---
<button id="themeToggle" aria-label="Toggle theme" title="Toggle theme">
  <svg class="icon-sun" aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
  <svg class="icon-moon" aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
</button>

<style>
  button {
    background: none;
    border: 1px solid var(--color-surface-border);
    border-radius: 0.25rem;
    padding: 0.4rem;
    cursor: pointer;
    color: var(--color-text-muted);
    display: flex;
    align-items: center;
  }

  button:hover {
    color: var(--color-accent);
    border-color: var(--color-accent);
  }

  /* Dark mode (default): show sun icon, hide moon */
  .icon-sun { display: block; }
  .icon-moon { display: none; }

  :global(.light) .icon-sun { display: none; }
  :global(.light) .icon-moon { display: block; }
</style>

<script is:inline>
  const theme = (() => {
    const stored = localStorage?.getItem('theme') ?? '';
    if (['dark', 'light'].includes(stored)) return stored;
    return 'dark'; // default to dark
  })();

  if (theme === 'light') {
    document.documentElement.classList.add('light');
  }
  window.localStorage.setItem('theme', theme);

  document.getElementById('themeToggle')?.addEventListener('click', () => {
    document.documentElement.classList.toggle('light');
    const isDark = !document.documentElement.classList.contains('light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
</script>
```

**Step 2: Create the Nav component**

Create `src/components/Nav.astro`:

```astro
---
import ThemeToggle from './ThemeToggle.astro';

const { pathname } = Astro.url;
---
<nav class="nav">
  <a href="/" class="nav-brand">~/laura</a>
  <div class="nav-links">
    <a href="/" class:list={[{ active: pathname === '/' || pathname === '/laura-naccarato-profile/' }]}>resume</a>
    <a href="/projects" class:list={[{ active: pathname.startsWith('/projects') || pathname.startsWith('/laura-naccarato-profile/projects') }]}>projects</a>
    <button class="print-btn" onclick="window.print()" aria-label="Print resume">print</button>
    <ThemeToggle />
  </div>
</nav>

<style>
  .nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 2rem;
    border-bottom: 1px solid var(--color-surface-border);
    margin-bottom: 2rem;
  }

  .nav-brand {
    font-weight: 700;
    font-size: 1.1rem;
    color: var(--color-text);
  }

  .nav-brand:hover {
    color: var(--color-accent);
    text-decoration: none;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .nav-links a {
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }

  .nav-links a.active {
    color: var(--color-accent);
  }

  .print-btn {
    background: none;
    border: 1px solid var(--color-surface-border);
    border-radius: 0.25rem;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    color: var(--color-text-muted);
    font-family: inherit;
    font-size: 0.875rem;
  }

  .print-btn:hover {
    color: var(--color-accent);
    border-color: var(--color-accent);
  }
</style>
```

**Step 3: Create the Footer component**

Create `src/components/Footer.astro`:

```astro
---
---
<footer class="footer">
  <p>&copy; {new Date().getFullYear()} &middot; Built with <a href="https://astro.build">Astro</a></p>
</footer>

<style>
  .footer {
    margin-top: 3rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--color-surface-border);
    text-align: center;
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }
</style>
```

**Step 4: Create the BaseLayout**

Create `src/layouts/BaseLayout.astro`:

```astro
---
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
import '../styles/global.css';

interface Props {
  title: string;
}

const { title } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <meta name="description" content="Laura Naccarato — Software Developer" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  </head>
  <body>
    <Nav />
    <main>
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

**Step 5: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 6: Commit**

```bash
git add src/layouts/ src/components/ src/styles/
git commit -m "feat: add base layout, nav, footer, and theme toggle"
```

---

### Task 6: Resume Page

**Files:**
- Create: `src/pages/index.astro`

**Step 1: Create the resume page**

Create `src/pages/index.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import yaml from 'js-yaml';
import fs from 'node:fs';

const resumeFile = fs.readFileSync('./src/data/resume.yaml', 'utf-8');
const resume = yaml.load(resumeFile) as any;
---
<BaseLayout title={`${resume.basics.name} — ${resume.basics.label}`}>
  <!-- Hero / Header -->
  <header class="hero">
    <h1 class="hero-name">{resume.basics.name}<span class="cursor">_</span></h1>
    <p class="hero-label">{resume.basics.label}</p>
    <div class="hero-links">
      {resume.basics.profiles.map((p: any) => (
        <a href={p.url} target="_blank" rel="noopener">{p.network}</a>
      ))}
      {resume.basics.email && <a href={`mailto:${resume.basics.email}`}>Email</a>}
    </div>
  </header>

  <!-- Experience -->
  <section>
    <h2 class="section-heading">cat experience</h2>
    {resume.work.map((job: any) => (
      <div class="entry">
        <div class="entry-header">
          <strong>{job.position}</strong>
          <span class="entry-date">{job.startDate} — {job.endDate || 'Present'}</span>
        </div>
        <p class="entry-sub">{job.company}</p>
        <ul class="entry-highlights">
          {job.highlights.map((h: string) => <li>{h}</li>)}
        </ul>
      </div>
    ))}
  </section>

  <!-- Education -->
  <section>
    <h2 class="section-heading">cat education</h2>
    {resume.education.map((edu: any) => (
      <div class="entry">
        <div class="entry-header">
          <strong>{edu.studyType} — {edu.area}</strong>
          <span class="entry-date">{edu.startDate} — {edu.endDate || 'Present'}</span>
        </div>
        <p class="entry-sub">{edu.institution}</p>
      </div>
    ))}
  </section>

  <!-- Skills -->
  <section>
    <h2 class="section-heading">cat skills</h2>
    <div class="skills-grid">
      {resume.skills.map((cat: any) => (
        <div class="skill-category">
          <h3 class="skill-name">{cat.name}</h3>
          <div class="skill-tags">
            {cat.keywords.map((kw: string) => <span class="tag">{kw}</span>)}
          </div>
        </div>
      ))}
    </div>
  </section>
</BaseLayout>

<style>
  .hero {
    margin-bottom: 2.5rem;
  }

  .hero-name {
    font-size: 2rem;
    font-weight: 700;
    line-height: 1.2;
  }

  .cursor {
    color: var(--color-accent);
    animation: blink 1s step-end infinite;
  }

  @keyframes blink {
    50% { opacity: 0; }
  }

  .hero-label {
    color: var(--color-text-muted);
    font-size: 1rem;
    margin-top: 0.25rem;
  }

  .hero-links {
    display: flex;
    gap: 1rem;
    margin-top: 0.75rem;
    font-size: 0.875rem;
  }

  section {
    margin-bottom: 2.5rem;
  }

  .entry {
    margin-bottom: 1.5rem;
  }

  .entry-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .entry-date {
    color: var(--color-text-muted);
    font-size: 0.8rem;
  }

  .entry-sub {
    color: var(--color-text-muted);
    font-size: 0.875rem;
    margin-top: 0.125rem;
  }

  .entry-highlights {
    margin-top: 0.5rem;
    padding-left: 1.25rem;
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  .entry-highlights li {
    margin-bottom: 0.25rem;
  }

  .skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
    gap: 1rem;
  }

  .skill-name {
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .skill-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }

  .tag {
    background: var(--color-accent-subtle);
    color: var(--color-accent);
    padding: 0.2rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
  }
</style>
```

**Step 2: Install js-yaml dependency**

Run: `npm install js-yaml && npm install -D @types/js-yaml`

**Step 3: Verify dev server renders correctly**

Run: `npm run dev`
Expected: Resume page renders at localhost with hero, experience, education, skills sections.

**Step 4: Commit**

```bash
git add src/pages/index.astro package.json package-lock.json
git commit -m "feat: add resume page rendering from YAML data"
```

---

### Task 7: Projects Page

**Files:**
- Create: `src/pages/projects.astro`
- Create: `src/components/ProjectCard.astro`

**Step 1: Create the ProjectCard component**

Create `src/components/ProjectCard.astro`:

```astro
---
interface Props {
  title: string;
  description: string;
  tech: string[];
  repo?: string;
  live?: string;
}

const { title, description, tech, repo, live } = Astro.props;
---
<article class="project-card">
  <div class="card-titlebar">
    <span class="dot red"></span>
    <span class="dot yellow"></span>
    <span class="dot green"></span>
    <span class="card-title">{title}</span>
  </div>
  <div class="card-body">
    <p class="card-desc">{description}</p>
    <div class="card-tech">
      {tech.map((t) => <span class="tag">{t}</span>)}
    </div>
    <div class="card-links">
      {repo && <a href={repo} target="_blank" rel="noopener">repo</a>}
      {live && <a href={live} target="_blank" rel="noopener">live</a>}
    </div>
  </div>
</article>

<style>
  .project-card {
    border: 1px solid var(--color-surface-border);
    border-radius: 0.5rem;
    overflow: hidden;
    background: var(--color-surface);
  }

  .card-titlebar {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 0.75rem;
    background: var(--color-code);
    border-bottom: 1px solid var(--color-surface-border);
  }

  .dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
  }

  .dot.red { background: #E0686E; }
  .dot.yellow { background: #E8A84E; }
  .dot.green { background: #5DA06E; }

  .card-title {
    margin-left: 0.5rem;
    font-size: 0.8rem;
    color: var(--color-text-muted);
  }

  .card-body {
    padding: 1rem;
  }

  .card-desc {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    margin-bottom: 0.75rem;
  }

  .card-tech {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    margin-bottom: 0.75rem;
  }

  .tag {
    background: var(--color-accent-subtle);
    color: var(--color-accent);
    padding: 0.2rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
  }

  .card-links {
    display: flex;
    gap: 0.75rem;
    font-size: 0.8rem;
  }
</style>
```

**Step 2: Create the projects page**

Create `src/pages/projects.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import ProjectCard from '../components/ProjectCard.astro';
import { getCollection } from 'astro:content';

const projects = (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
---
<BaseLayout title="Projects — Laura Naccarato">
  <header>
    <h1 class="section-heading">ls projects/</h1>
  </header>

  <div class="projects-grid">
    {projects.map((project) => (
      <ProjectCard
        title={project.data.title}
        description={project.data.description}
        tech={project.data.tech}
        repo={project.data.repo}
        live={project.data.live}
      />
    ))}
  </div>
</BaseLayout>

<style>
  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
    gap: 1.25rem;
  }
</style>
```

**Step 3: Verify dev server**

Run: `npm run dev`
Expected: `/projects` page renders with the example project card showing terminal window frame.

**Step 4: Commit**

```bash
git add src/pages/projects.astro src/components/ProjectCard.astro
git commit -m "feat: add projects page with terminal-style project cards"
```

---

### Task 8: Print Styles

**Files:**
- Modify: `src/styles/global.css`

**Step 1: Add print media query to global.css**

Append to `src/styles/global.css`:

```css
/* Print styles */
@media print {
  :root {
    --color-bg: #FFFFFF;
    --color-surface: #FFFFFF;
    --color-surface-border: #E0E0E0;
    --color-text: #1a1a1a;
    --color-text-muted: #555555;
    --color-accent: #C4515C;
    --color-accent-hover: #A8404A;
    --color-accent-subtle: #F5E6E6;
    --color-code: #F5F5F5;
  }

  html {
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 11pt;
    line-height: 1.4;
  }

  body {
    max-width: none;
    padding: 0;
  }

  /* Hide non-resume elements */
  .nav,
  .footer,
  .cursor,
  #themeToggle,
  .print-btn {
    display: none !important;
  }

  /* Remove link underlines, show URL */
  a {
    color: var(--color-text);
    text-decoration: none;
  }

  .hero-links a::after {
    content: ' (' attr(href) ')';
    font-size: 0.75em;
    color: var(--color-text-muted);
  }

  /* Clean section headings for print */
  .section-heading::before {
    content: none;
  }

  .section-heading {
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text);
  }

  /* Prevent page breaks inside entries */
  .entry {
    break-inside: avoid;
  }

  section {
    break-inside: avoid;
    margin-bottom: 1rem;
  }

  .hero {
    margin-bottom: 1rem;
  }
}
```

**Step 2: Verify print output**

Run: `npm run dev`
Open browser, navigate to `/`, press Ctrl+P.
Expected: Print preview shows clean, light resume with no nav/footer/cursor, system font, readable layout.

**Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add print styles for clean resume PDF output"
```

---

### Task 9: GitHub Actions Deployment

**Files:**
- Create: `.github/workflows/deploy.yml`

**Step 1: Create the GitHub Actions workflow**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v5
      - name: Install, build, and upload
        uses: withastro/action@v5

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Step 2: Verify build locally one final time**

Run: `npm run build`
Expected: Clean build, no errors.

**Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Actions workflow for Pages deployment"
```

---

### Task 10: Final Verification and Cleanup

**Step 1: Run full build**

Run: `npm run build`
Expected: Build succeeds with no warnings or errors.

**Step 2: Test dev server end-to-end**

Run: `npm run dev`

Verify:
- [ ] `/` renders resume with hero, experience, education, skills
- [ ] `/projects` renders project cards with terminal frames
- [ ] Theme toggle switches between dark and light
- [ ] Print preview of `/` produces clean PDF-ready output
- [ ] Nav links highlight the active page
- [ ] Mobile responsive (resize browser)

**Step 3: Clean up any Astro default files**

Remove any leftover files from the Astro template (e.g., default `src/pages/index.astro` content if still present).

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore: final cleanup and verification"
```
