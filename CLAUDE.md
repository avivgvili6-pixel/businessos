# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BusinessOS is a Hebrew-language (RTL) business management operating system built as a single-page React app. It manages multiple businesses/startups with modules for sales pipeline, customer success, finance, people/HR, strategy, projects, meetings, and an AI advisor ("Jarvis"). All UI text and data is in Hebrew.

## Development Commands

```bash
npm install       # Install dependencies (no node_modules in repo)
npm run dev       # Start Vite dev server
npm run build     # Production build to dist/
npm run preview   # Preview production build locally
```

There are no tests, no linter, and no formatter configured.

## Critical File State Issue

The repository has a file-naming mismatch from the original GitHub upload. The actual React application code (2520 lines) currently lives in `vite.config.js` in commit `fa274f4`, but was removed in the latest commit (`405dc17`) which replaced it with proper Vite config. As a result, **the app is currently broken** — `App.jsx` contains JSON (the real package.json content), and `package.json` contains HTML.

To restore the app code:
```bash
git show fa274f4:vite.config.js > App.jsx
```
Then fix `package.json` with the correct JSON (name, version, scripts, react deps).

## Architecture

The entire application is designed as a **single file** (`App.jsx`) containing all constants, data, and React components — no component splitting, no routing library, no state management library, no external UI components.

### Navigation / Routing

State-based routing: a `view` string drives which module renders. The `<BusinessOS>` root component holds `user`, `view`, `activeBiz`, and `sidebarOpen` state. Sidebar navigation calls `setView()` to switch modules.

### Module System

13 modules gated by `ROLE_MODULES`:

| Module ID | Component | Roles with access |
|-----------|-----------|-------------------|
| `dashboard` | `<Dashboard>` | all |
| `businesses` | `<BusinessesView>` | owner only |
| `strategy` | `<Strategy>` | owner |
| `planner` | `<Planner>` | all |
| `projects` | `<Projects>` | owner, vp_sales, cs_mgr |
| `meetings` | `<Meetings>` | all |
| `sales` | `<Sales>` | owner, vp_sales, sdr, ae |
| `cs` | `<CustomerSuccess>` | owner, cs_mgr |
| `finance` | `<Finance>` | owner |
| `people` | `<People>` | owner, vp_sales, cs_mgr |
| `org` | `<OrgChart>` | owner, vp_sales, cs_mgr |
| `experts` | `<Experts>` | all |
| `guide` | `<GuideView>` | all |

### Authentication

Hardcoded demo users in the `USERS` array. Login is purely client-side string matching — no backend, no JWT. Five roles: `owner`, `vp_sales`, `cs_mgr`, `sdr`, `ae`.

### Data Model

All data is **in-memory** — no API calls, no database, no localStorage persistence. Business-specific data lives in `BIZ_DATA[bizId]`. Two demo businesses: `biz1` (TechSell Ltd, SaaS) and `biz2` (GreenGrow, AgriTech). `getBizData(bizId)` merges business-specific data with defaults.

### Design System

Colors are defined in the `C` constant object at the top of the file:
- `C.gold` (`#c8a84b`) — primary brand color, active states
- `C.ink` (`#0d0d14`) — dark background, sidebar
- `C.paper` (`#f7f4ee`) — main background
- `C.accent` (`#1a3a5c`) — secondary/info color

All styling is inline (`style={{}}`). No CSS files, no CSS modules, no Tailwind.

RTL layout: `direction: rtl` is set on `body` in `index.html` and on the root `div` in `<BusinessOS>`. Fonts: Heebo (primary), Space Mono (mono accents), loaded from Google Fonts in `index.html`.

### Shared UI Primitives

Defined near the top of the file after constants:
- `<Card>` — white card container
- `<StatCard icon label value sub color>` — KPI metric card
- `<AIBox title>` — gold-bordered AI insight panel
- `<Tag type>` — status badge (`n`=neutral, `g`=green, `r`=red, `p`=purple, `o`=orange)
- `<MiniBar val max color h>` — horizontal progress bar
- `<SectionHead tag title>` — section header with decorative tag
- `<G4>` / `<G2>` — CSS grid wrappers (4-col auto-fit and 2-col auto-fit)

### Jarvis AI Agent

`<JarvisAgent>` is a floating chat widget that appears on all screens. It uses `ROLE_CONTEXT`, `SCREEN_CONTEXT`, and `QUICK_PROMPTS` to inject context into user prompts. It does **not** call any real AI API — responses are hardcoded/simulated.

### Profitability Calculator

`<ProfitabilityCalculator>` is an embedded financial model (~360 lines) inside the Finance module. Uses `CALC_DEFAULTS[bizId]` for per-business initial values and `calcTotals(m)` to compute P&L.

## Deployment

Intended for Vercel deployment (static site). `vite build` outputs to `dist/`. No environment variables or server-side logic required.
