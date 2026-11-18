# ICAM

ICAM is a planned Web-Based Resilience System for Laboratory Equipment Requisition and Inventory Control for St. Dominic College of Asia.

The project uses Nuxt 4, Vue 3, TypeScript, Nitro, Supabase PostgreSQL, Supabase Auth, Tailwind CSS 4, DaisyUI 5, and Lucide Vue.

## Current setup

This repository currently contains the Nuxt 4 starter application and planning skeleton. Core application workflows and database schemas have not been implemented.

## Development

Prerequisites are Node.js 24 and npm 11.

```bash
npm install
npm run dev
```

The development server is available at `http://localhost:3000/`.

## Architecture

- Nuxt application code lives under `app/`.
- The 17 ICAM modules are organized by feature and category under `app/features/`.
- Nitro API handlers live under `server/api/v1/`.
- Shared frontend/backend definitions live under `shared/types/`.
- Repositories, services, policies, validators, utilities, and server middleware provide server-side boundaries.
- Protected API handlers must explicitly authenticate and authorize requests. Client navigation middleware is not authorization.
- Supabase PostgreSQL is the authoritative database.
- Activity records must be written server-side only as part of successful controlled operations.

## Environment configuration

Copy `.env.example` for variable names. Do not commit real secrets.

```bash
cp .env.example .env
```

The `.env.example` file contains placeholders only.

## Planned structure

Documentation is maintained under `docs/`, and module-level planning remains organized by the five ICAM categories.

## Pending setup

The following remain pending explicit approval and implementation:

- Installing Tailwind CSS 4 and DaisyUI 5 dependencies
- Installing and configuring `@nuxtjs/supabase`
- Adding Vitest and Playwright dependencies/configuration
- Defining Supabase migrations and database policies
- Implementing authentication and authorization
- Implementing the 17 business modules
