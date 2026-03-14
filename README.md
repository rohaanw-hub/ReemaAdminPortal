# Reema Admin Portal

A full-featured admin and operations portal for managing a tutoring center — built with React + Vite.

## Overview

Reema Admin Portal is an internal management tool that covers every operational need of a tutoring center:

- **Employee Management** — profiles, scheduling, reliability tracking, callout logging
- **Student Management** — academic level tracking (reading, writing, math), parent contacts, attendance
- **Schedule Builder** — weekly view, conflict detection, auto-reassignment on cancellations
- **Clock In / Out** — photo-verified clock-in system tied directly to payroll
- **Payroll** — automatic hour tracking and gross pay calculations per employee

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React 18](https://react.dev/) |
| Build Tool | [Vite 5](https://vitejs.dev/) |
| Routing | [React Router v6](https://reactrouter.com/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Date Utilities | [date-fns](https://date-fns.org/) |
| Linting | ESLint + eslint-plugin-react |
| Formatting | Prettier |

> **Backend not yet connected.** All data currently lives in React state with seed data. Supabase integration is planned for v2.

---

## Project Structure

```
ReemaAdminPortal/
├── public/                   # Static assets (favicon, etc.)
├── src/
│   ├── assets/               # Images, fonts, static files
│   ├── components/           # Shared/reusable UI components
│   │   └── Layout.jsx        # Sidebar + topbar shell
│   ├── context/
│   │   └── AppContext.jsx    # Global state (employees, students, sessions)
│   ├── hooks/                # Custom React hooks
│   ├── pages/                # One file per route/page
│   │   ├── Dashboard.jsx
│   │   ├── Employees.jsx
│   │   ├── EmployeeProfile.jsx
│   │   ├── Students.jsx
│   │   ├── StudentProfile.jsx
│   │   ├── Schedule.jsx
│   │   ├── ClockIn.jsx
│   │   └── Payroll.jsx
│   ├── utils/
│   │   └── helpers.js        # Pure utility functions and constants
│   ├── App.jsx               # Route definitions
│   ├── index.css             # Global styles + CSS variables
│   └── main.jsx              # React entry point
├── .env.example              # Environment variable template
├── .eslintrc.cjs             # ESLint config
├── .gitignore
├── .prettierrc               # Prettier config
├── index.html                # HTML entry point
├── package.json
└── vite.config.js
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) v9 or higher (comes with Node)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/rohaanw-hub/ReemaAdminPortal.git
cd ReemaAdminPortal

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values (no values needed yet for prototype)

# 4. Start the development server
npm run dev
```

The app will open at **http://localhost:3000**

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server at localhost:3000 |
| `npm run build` | Build for production (output to `/dist`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across all source files |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run format` | Format all files with Prettier |

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in values. **Never commit `.env.local` to git.**

```env
VITE_APP_NAME=ReemaAdminPortal

# Add when backend is connected:
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...
```

All Vite env vars must be prefixed with `VITE_` to be accessible in the browser.

---

## Roadmap

### v1 — Prototype (current)
- [x] Employee list, profiles, reliability tracking
- [x] Student list, profiles, academic level tracking
- [x] Weekly schedule view with cancellation/reassignment
- [x] Clock in / out with photo verification
- [x] Payroll hours summary

### v2 — Backend Integration
- [ ] Connect Supabase (auth, database, storage)
- [ ] Admin login / authentication
- [ ] Persist all data to database
- [ ] Parent portal (read-only student view)
- [ ] SMS/email notifications on cancellations

### v3 — Advanced Features
- [ ] Automated scheduling algorithm
- [ ] Invoice and billing generation
- [ ] Progress reports (PDF export)
- [ ] Mobile app (React Native)

---

## Contributing

This is a private internal project. To make changes:

1. **Always branch off `main`**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Keep commits small and descriptive**
   ```bash
   git commit -m "feat: add parent notification on session cancellation"
   ```

3. **Run lint and format before committing**
   ```bash
   npm run lint
   npm run format
   ```

4. **Open a pull request** — even for solo projects, PRs create a useful paper trail.

### Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Use for |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `chore:` | Config, dependencies, tooling |
| `docs:` | Documentation only |
| `refactor:` | Code change with no feature/fix |
| `style:` | Formatting, whitespace |

---

## License

Private — internal use only for Reema Tutoring Center.
