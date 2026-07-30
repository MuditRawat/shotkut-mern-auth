# Shotkut MERN Authentication - AI Development Transcript

## AI Tool Used:
Google AI Studio (Gemini 3.6 Flash)

## Purpose:
This document details the selected engineering workflow and interaction logs with Google AI Studio (Gemini 3.6 Flash) during the technical assessment for **Shotkut MERN Authentication**. Gemini was utilized throughout the development lifecycle for:
- Codebase architecture analysis and design
- Full-stack MERN implementation assistance
- Debugging complex deployment issues on Render and Vercel
- Codebase structure cleanup and production hardening
- Security auditing of authentication flows (JWT & Cookies)
- Comprehensive technical documentation generation
- Continuous build and linter verification

---

# Selected Development Transcript

---

## 1. Initial MERN Authentication Application Setup

### User Prompt:
Create a production-ready MERN authentication application using React, Vite, TypeScript, Express, Node.js, and MongoDB. Implement user registration, login, protected routes, and a two-token authentication architecture with short-lived JWT access tokens and HTTP-only refresh tokens.

### AI Response Summary:
- **Architecture Design:** Designed a decoupled client-server architecture with an Express backend serving RESTful API routes (`/api/auth` and `/api/user`) and a React/TypeScript Vite frontend.
- **Two-Token System:** Configured short-lived JWT access tokens (15-minute lifespan) returned in the response payload for in-memory client storage, and long-lived refresh tokens (7-day lifespan) delivered via HTTP-only cookies.
- **Database Integration:** Configured Mongoose connection to MongoDB Atlas with schema-level protection (`select: false` on sensitive password and refresh token fields).
- **Directory Layout:** Structured the codebase into clean `src/` (frontend React application) and `server/` (backend Express application) directories.

---

## 2. Authentication Security Review

### User Prompt:
Audit the security of the authentication system. Review password hashing, token storage, protected route mechanics, and refresh token rotation logic to ensure industry best practices.

### AI Response Summary:
- **Password Security:** Verified `bcryptjs` hashing with 10 salt rounds prior to persisting user records in MongoDB (`User.ts` model middleware).
- **In-Memory Access Tokens:** Confirmed access tokens are strictly stored in React memory state (`AuthContext.tsx`) and attached dynamically via Axios interceptors, eliminating XSS vulnerabilities associated with `localStorage`.
- **Protected Routes:** Verified client-side route guards (`ProtectedRoute` and `PublicOnlyRoute`) to prevent unauthorized view access and redundant login states.
- **Refresh Token Security:** Audited token refresh endpoint (`/api/auth/refresh`), verifying cookie extraction, signature verification against `REFRESH_TOKEN_SECRET`, database token match, and seamless reissue of access tokens.

---

## 3. Render Deployment Debugging

### User Prompt:
The backend deployment on Render is failing with `MODULE_NOT_FOUND` when executing `node dist/server.js`. Fix the ES Module vs CommonJS build conflicts and ensure the backend compiles cleanly.

### AI Response Summary:
- **Root Cause Analysis:** Identified that Node.js native ESM execution in the backend was triggering strict runtime path resolution errors on relative imports when attempting to run compiled JavaScript output.
- **Solution Implementation:** Updated `server/package.json` build script to utilize `esbuild`:
  ```json
  "build": "esbuild src/app.ts --bundle --platform=node --format=cjs --packages=external --outfile=dist/server.cjs"
  ```
- **Configuration Fix:** Updated the production start command to `node dist/server.cjs`. Bundling into a single CommonJS (`.cjs`) output resolved all relative file import issues while keeping external npm dependencies external (`--packages=external`).

---

## 4. Vercel Deployment Debugging

### User Prompt:
The frontend deployment on Vercel returns `404 NOT_FOUND` on route navigation and fails during build because of root script misconfigurations. Fix the frontend Vercel deployment configuration.

### AI Response Summary:
- **Build Script Alignment:** Configured root `package.json` build script to run `vite build`, outputting compiled static assets to the standard `dist/` directory.
- **Single Page Application Routing:** Created/verified `vercel.json` with rewrite rules to direct all incoming client requests to `index.html`:
  ```json
  {
    "rewrites": [
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```
- **Result:** Enabled seamless deep-linking and client-side page refreshes across React Router paths without triggering Vercel 404 errors.

---

## 5. Environment Variable Configuration

### User Prompt:
Set up and document all required environment variables for both frontend and backend environments to support cross-domain communication between Vercel and Render.

### AI Response Summary:
- **Frontend Variables:** Defined `VITE_API_BASE_URL` without trailing path suffixes (`https://your-backend-service.onrender.com`), enabling Axios base client initialization:
  ```typescript
  export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  ```
- **Backend Variables:** Defined `PORT`, `NODE_ENV`, `CLIENT_URL`, `MONGODB_URI`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `ACCESS_TOKEN_EXPIRE`, and `REFRESH_TOKEN_EXPIRE`.
- **Documentation:** Added `.env.example` templates and clear instructions in `README.md`.

---

## 6. Cross-Domain Cookie Security Audit

### User Prompt:
Review and fix issues with refresh token cookies not being saved by the browser during cross-domain authentication between the Vercel frontend and Render backend.

### AI Response Summary:
- **CORS Setup:** Configured Express `cors()` middleware with explicit options:
  - `origin: process.env.CLIENT_URL` (dynamic matching of Vercel origin)
  - `credentials: true` (allows sending and receiving cookies)
  - `allowedHeaders: ['Content-Type', 'Authorization']`
- **Cookie Attribute Hardening:** Updated `res.cookie()` configuration in `authController.ts` for cross-domain support:
  ```typescript
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
  ```
- **Result:** `SameSite=None; Secure` configuration ensured modern browsers store and send the refresh token cookie on cross-site requests.

---

## 7. Repository Cleanup

### User Prompt:
Clean up the project repository by removing temporary test files, redundant dependencies, and build artifacts, ensuring a production-ready folder structure.

### AI Response Summary:
- **Directory Inspection:** Audited root and `server/` file trees using directory listing tools.
- **Artifact Removal:** Ensured build output folders (`dist/`) and external modules (`node_modules/`) are properly ignored in `.gitignore`.
- **Structure Verification:** Verified that frontend assets (`src/`), backend logic (`server/`), root configurations (`package.json`, `vercel.json`, `vite.config.ts`), and documentation files are cleanly organized and properly formatted.

---

## 8. README.md Generation

### User Prompt:
Create a professional `README.md` for the repository suitable for a technical assessment submission.

### AI Response Summary:
- Generated a structured `README.md` containing:
  - Project Overview and Key Features
  - Complete Tech Stack details (Frontend, Backend, Deployment)
  - System Architecture diagram
  - Detailed Project Directory tree
  - Environment Variable definitions
  - Local Development setup steps
  - Vercel and Render Deployment guidelines
  - Step-by-step Authentication Flow documentation
  - Future Improvement roadmap

---

## 9. ARCHITECTURE.md Generation

### User Prompt:
Create a concise `ARCHITECTURE.md` document summarizing the application architecture, database choices, deployment platforms, token flows, and cross-domain security handling.

### AI Response Summary:
- Authored `ARCHITECTURE.md` covering:
  - **Frontend:** React + Vite + TypeScript + Axios interceptors + In-memory token storage.
  - **Backend:** Node.js + Express + TypeScript + Layered architecture + Error middleware.
  - **Database:** MongoDB Atlas + Mongoose ORM.
  - **Deployment Selection Rationale:** Vercel (Frontend SPA Edge CDN), Render (Node.js Container API), MongoDB Atlas (Cloud NoSQL DB).
  - **Security Protocols:** Detailed JWT Access Token flow, Refresh Token Cookie lifecycle, and CORS cross-domain credential negotiation.

---

## 10. Final Verification

### User Prompt:
Run full build, typecheck, and linter verifications to confirm that the repository builds with zero compilation errors.

### AI Response Summary:
- **TypeScript Verification:** Executed `tsc --noEmit` across both frontend and backend TypeScript project configurations (`server/tsconfig.json` and root `tsconfig.json`).
- **Application Compilation:** Executed `compile_applet` build tool to verify Vite frontend build and esbuild server bundling.
- **Result:** Confirmed zero linter errors and 100% clean production build compilation.
