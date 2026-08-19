<div align="center">

# 🩺 Clinic Booking API

**A Node.js + TypeScript backend for a clinic appointment booking system.**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B%20(20%20rec.)-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com)
[![Firebase Admin](https://img.shields.io/badge/Auth-Firebase%20Admin-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/docs/admin/setup)
[![License](https://img.shields.io/badge/License-Unspecified-lightgrey)](#-license)

</div>

---

## 📖 Overview

Starter backend for a clinic appointment booking system, built with **Node.js**, **Express**, and **TypeScript**. Created to fulfill the requirements of the *"Systems Fundamentals"* module, demonstrating foundational concepts in full-stack system development.

Serves the [`clinic-booking-frontend`](https://github.com/laspraharshana/clinic-booking-frontend) Flutter client.

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ (20 recommended), TypeScript 5.5 |
| Framework | Express 4 |
| Validation | Zod 4 |
| Auth / Data | firebase-admin |
| Security middleware | helmet, cors, express-rate-limit |
| File uploads | multer |
| Dev tooling | tsx (hot reload), ESLint, Prettier |

## 📁 Project Structure

```
src/                    # Application source
scripts/
└── seed.ts             # Database seeding script
.github/
└── workflows/          # CI configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (Node 20 recommended)
- npm
- A Firebase project with a service account for `firebase-admin`

### Setup

**1. Clone the repository**
```bash
git clone https://github.com/laspraharshana/clinic-booking-mobile-app.git
cd clinic-booking-mobile-app
```

**2. Copy the environment file and fill in your own values**
```bash
cp .env.example .env
```

**3. Install dependencies**
```bash
npm ci
```

**4. Run in development mode (hot reload)**
```bash
npm run dev
```

**5. Verify the server is up**
```bash
curl http://localhost:8080/healthz
```

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run the compiled build |
| `npm run lint` | Lint the codebase |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Check formatting without writing |
| `npm run seed` | Seed the database |

## 🔒 Security Note

> ⚠️ **Firebase Admin SDK credentials must never be committed to the repository.**

Keep the service account JSON out of version control (add it to `.gitignore`) and load it via environment variables or a secrets manager instead. If a service account key has ever been committed to this repo's history, **rotate it in the Firebase console** and scrub it from git history.

## 👥 Collaborators

| Name | GitHub | Role |
|---|---|---|
| laspraharshana | [@laspraharshana](https://github.com/laspraharshana) | Backend Developer |
| Kosala Pushpakumara | [@KosalaCodes](https://github.com/KosalaCodes) | Backend Developer |
| Dimesha Adikari | [@dimesha12](https://github.com/dimesha12) | Frontend Developer |
| Kavindi Chamika | [@Kv23-corder](https://github.com/Kv23-corder) | Frontend Developer |
| lakminiweb | [@lakminiweb](https://github.com/lakminiweb) | Frontend Developer |
| Sanoj Dayarathna | [@Sanoj5c](https://github.com/Sanoj5c) | Frontend Developer |

## 🔗 Related Repository

- **Frontend client:** [clinic-booking-frontend](https://github.com/laspraharshana/clinic-booking-frontend)
