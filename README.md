<h1 align="center">
  <br>
  MediFlux
  <br>
</h1>

<h4 align="center">A production-grade Multi-Tenant Healthcare Intelligence SaaS Platform</h4>

<p align="center">
  <a href="#architecture">Architecture</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#features">Features</a> •
  <a href="#getting-started">Getting Started</a>
</p>

---

## Overview

MediFlux simulates a FAANG-level frontend system built for a high-performance Healthcare SaaS. It demonstrates a highly scalable **Micro-Frontend Architecture** housed within a **Turborepo Monorepo**, ensuring rapid builds and strict boundary encapsulation between domain modules.

The project features a premium, responsive Design System, real-time data handling simulations (WebSockets), robust state management, and an API abstraction layer mocking real-world data contracts.

## Architecture

We use a **Micro-Frontend + Modular Monorepo** approach:

- **`apps/web`**: The main Application Shell. Handles routing, authentication, and the global layout.
- **`apps/patient-mf`**: A Micro-Frontend containing the Patient Management module. Dynamically injected into the shell via Vite Module Federation.
- **`apps/analytics-mf`**: A Micro-Frontend housing the complex Analytics module.
- **`packages/ui`**: Shared, premium Design System components built with Tailwind CSS.
- **`services/api` & `mocks/msw`**: API contracts backed by Mock Service Worker for fully offline, realistic data simulation.
- **`services/websocket`**: Mock real-time bidirectional communication.

## Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| **UI**         | React + TypeScript                  |
| **State**      | Zustand + React Query               |
| **Data**       | Mock Service Worker (MSW)           |
| **Auth**       | Firebase (Mocked)                   |
| **Styling**    | Tailwind CSS + Design Tokens        |
| **Build**      | Vite + Turborepo                    |
| **Testing**    | Vitest + React Testing Library + Playwright |
| **CI/CD**      | GitHub Actions + Vercel             |

## Features

- **🛡️ Role-Based Access Control**: Secure routes depending on `admin` vs `doctor` roles.
- **⚡ Micro-Frontend Integration**: Independent deployment pipelines (simulated) for different domain modules.
- **📊 Real-time Analytics**: Interactive charts using Recharts.
- **🔔 Event-driven Notifications**: Simulated WebSocket client pushing critical alerts to the UI.
- **🎨 Premium Design System**: CSS variables, semantic tokens, and reusable components.

## Getting Started

### Prerequisites
- Node.js v18+
- npm v8+

### Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development servers**:
   Since we use Vite Module Federation, we must start the micro-frontend remotes first to ensure the App Shell can consume them.
   ```bash
   # Start the Patient MFE
   cd apps/patient-mf && npm run dev
   
   # Start the Analytics MFE (in another terminal)
   cd apps/analytics-mf && npm run dev
   
   # Start the App Shell (in another terminal)
   cd apps/web && npm run dev
   ```

3. **Login credentials**:
   - Admin: `admin@mediflux.com` / `password`
   - Doctor: `doctor@mediflux.com` / `password`

## CI/CD & Observability

This repository includes a GitHub Actions pipeline (`.github/workflows/ci.yml`) configured to automatically run linting, unit tests, and Playwright E2E tests on every PR. Vercel is configured for seamless deployment.

---
*Built to simulate engineering excellence.*
