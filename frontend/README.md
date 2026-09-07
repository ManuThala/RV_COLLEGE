# CyberShield: The Cybersecurity Challenge

A polished frontend-only cybersecurity competition built with React, TypeScript, Vite, and Tailwind CSS.

## Setup

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

## Demo admin PIN

The admin panel uses a demo PIN stored in `.env.local` or an environment variable. Example:

```bash
VITE_DEMO_ADMIN_PIN=1234
```

## Future Backend Integration

This frontend is intentionally separated from the future backend so the following local services can later be replaced by Python FastAPI and PostgreSQL integrations:

- Team registration and profile persistence via localStorage -> FastAPI team endpoints
- Game session persistence -> PostgreSQL-backed session tables
- Quiz selection and completion tracking -> API-driven challenge logic
- Leaderboard calculation -> WebSocket or polling-based live leaderboard service
- Admin question management -> protected backend admin API and database tables
- Competition status -> server-side lifecycle management

## Deployment

This project is ready for Netlify static hosting and includes SPA redirect support via `netlify.toml`.
