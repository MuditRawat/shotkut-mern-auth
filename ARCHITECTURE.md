# Architecture & Deployment Summary

**Project:** Shotkut MERN Authentication  
**Type:** Full-Stack MERN Technical Assessment  

---

## 1. Frontend Architecture

- **Framework & Tooling:** Built using **React 18**, **TypeScript**, and **Vite** for fast compilation, minimal bundle footprints, and strong type safety.
- **State & Authentication Management:** Centralized `AuthContext` provides session state (`user`, `token`, `isAuthenticated`, `loading`) across the component tree.
- **Token Storage & Security:** Access tokens are stored **in-memory** within React state rather than `localStorage` or `sessionStorage` to mitigate Cross-Site Scripting (XSS) risks.
- **HTTP Client (Axios):**
  - Configured with `withCredentials: true` to automatically send HTTP-only cookies on requests.
  - **Request Interceptor:** Dynamically attaches the Bearer token (`Authorization: Bearer <token>`) to outgoing API calls when available.
  - **Response Interceptor:** Intercepts `401 Unauthorized` responses to automatically trigger a token refresh request (`/api/auth/refresh`), restoring session state seamlessly without disrupting user flow.
- **Routing & Route Protection:** Implements `React Router` with declarative route guards:
  - `ProtectedRoute`: Guards private views (e.g., Dashboard), redirecting unauthenticated users to `/login`.
  - `PublicOnlyRoute`: Restricts authenticated users from re-visiting `/login` or `/signup`, redirecting them to `/dashboard`.

---

## 2. Backend Architecture

- **Runtime & Framework:** Built on **Node.js** with **Express.js** in **TypeScript**.
- **Modular Layered Architecture:**
  - **Routes (`/routes`):** Defines RESTful endpoints (`/api/auth/*` and `/api/user/*`).
  - **Controllers (`/controllers`):** Encapsulates business logic for authentication (`signup`, `login`, `refresh`, `logout`) and profile fetching (`getMe`).
  - **Middleware (`/middleware`):** Features `authMiddleware` for JWT verification and a centralized `errorHandler` for consistent error payloads.
  - **Models (`/models`):** Defines Mongoose schemas with strict field selection (`select: false` on password and refreshToken).
  - **Utilities (`/utils`):** Handles bcrypt hashing (`hashPassword`, `comparePassword`) and JWT token signing/verification (`generateAccessToken`, `generateRefreshToken`, `verifyAccessToken`, `verifyRefreshToken`).
- **Error Handling & Security:** Input sanitization, password length validation, email normalization, and standardized JSON error responses.

---

## 3. Database Choice

- **Database System:** **MongoDB Atlas** (Cloud NoSQL Document Database) using **Mongoose ORM**.
- **Rationale for Selection:**
  - Document-based data modeling aligns naturally with JSON structures and TypeScript interfaces.
  - Flexible schema customization allowing explicit control over sensitive fields (`password` and `refreshToken` hidden by default).
  - Native atomic updates (`save()`, `findOne()`, `findById()`) for token rotation and invalidation.
  - Built-in connection pooling and reliable cloud hosting via MongoDB Atlas.

---

## 4. Deployment Platforms & Selection Rationale

| Layer | Platform | Rationale |
| :--- | :--- | :--- |
| **Frontend** | **Vercel** | Edge network optimized for SPA delivery, seamless GitHub integration, global CDN caching, and automatic Vite build optimization. |
| **Backend** | **Render** | Production-ready Node.js container hosting with native environment variable management, automatic HTTPS, and reliable continuous deployment from Git. |
| **Database** | **MongoDB Atlas** | Fully managed multi-region cloud database cluster with automatic scaling, encrypted storage, and robust connection string support (`mongodb+srv://`). |

---

## 5. JWT Access Token Flow

1. **Generation:** Issued upon successful credentials verification during `POST /api/auth/login` or session restoration via `POST /api/auth/refresh`.
2. **Payload & Lifespan:** Contains user ID (`userId`), signed with `ACCESS_TOKEN_SECRET`, with a short 15-minute expiration (`15m`).
3. **Storage:** In-memory inside React `AuthContext` (never saved in `localStorage`).
4. **Usage:** Attached via HTTP header: `Authorization: Bearer <accessToken>`.
5. **Verification:** Validated on protected backend routes by `authMiddleware` via `jwt.verify()`.

---

## 6. Refresh Token Cookie Flow

1. **Generation:** Long-lived JWT (`7d` expiry) generated alongside the access token during authentication.
2. **Persistence:** Stored in the MongoDB `User` document (with `select: false`) to support token rotation and revocation.
3. **Cookie Attributes:**
   - `httpOnly: true` (Inaccessible to client-side JavaScript via `document.cookie`).
   - `secure: true` in production (Transmitted strictly over HTTPS).
   - `sameSite: 'none'` in production (Required for cross-origin cookie delivery between Vercel and Render).
   - `path: '/'` and `maxAge: 7 days`.
4. **Token Rotation & Invalidation:**
   - Endpoint `POST /api/auth/refresh` reads the incoming cookie, verifies signature and DB match, and issues a fresh access token and new refresh token pair.
   - Endpoint `POST /api/auth/logout` clears the DB `refreshToken` field and issues a `res.clearCookie('refreshToken')`.

---

## 7. CORS & Cross-Domain Authentication Handling

- **Cross-Domain Setup:** Frontend on `https://<app>.vercel.app` and Backend on `https://<api>.onrender.com`.
- **CORS Configuration:**
  - Express CORS middleware configured with `origin: process.env.CLIENT_URL` (restricts API access strictly to the frontend origin).
  - `credentials: true` enabled on backend CORS configuration to accept cross-origin cookies and authorization headers.
  - `allowedHeaders: ['Content-Type', 'Authorization']` and explicit HTTP method whitelist (`GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`).
- **Browser Compatibility:** `SameSite=None; Secure` flags on the refresh token cookie ensure modern browsers allow credentials to pass seamlessly across distinct domains without security policy rejections.
