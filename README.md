# Shotkut MERN Authentication

## Overview

Shotkut MERN Authentication is a production-ready, full-stack authentication system built with the MERN stack (MongoDB, Express, React, Node.js) and TypeScript. It features a secure dual-token authentication scheme utilizing short-lived JWT access tokens in memory and persistent HTTP-only cross-domain refresh token cookies, along with protected routes, password hashing, and complete MongoDB database integration.

---

## Features

- **User Registration & Login**: Secure account creation and authentication workflows.
- **JWT Access Token Authentication**: Short-lived access tokens for authorization header bearer requests.
- **HTTP-Only Refresh Token Cookies**: Secure, cross-domain session cookies (`SameSite=None`, `Secure=true` in production).
- **Protected Dashboard Routes**: Client-side route guards enforcing session authentication.
- **Password Hashing**: Industry-standard bcrypt password hashing before database storage.
- **Automatic Session Persistence**: Seamless token renewal on application startup.
- **Logout Functionality**: Server-side and client-side token revocation and cookie clearance.
- **Cross-Domain Support**: Configured CORS and credentials sharing for cross-domain deployments (e.g., Vercel to Render).
- **Responsive React UI**: Clean, accessible, and responsive user interface built with React and Tailwind CSS.

---

## Tech Stack

### Frontend
- **React** (v18+)
- **Vite**
- **TypeScript**
- **Axios** (with credentials and request interceptors)
- **React Router**

### Backend
- **Node.js**
- **Express.js**
- **TypeScript**
- **MongoDB** & **Mongoose**
- **JSON Web Tokens (JWT)**
- **bcrypt / bcryptjs**

### Deployment
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas

---

## Architecture

```text
React Frontend (Vercel)
        |
        | Axios API Requests (with Credentials)
        v
Express Backend (Render)
        |
        | Mongoose ORM
        v
 MongoDB Atlas
```

---

## Project Structure

```text
.
├── src/                    # Frontend React TypeScript application
│   ├── api/                # Axios instance configuration and interceptors
│   ├── components/         # Protected and public route guards
│   ├── context/            # Authentication React context provider
│   ├── pages/              # Application pages (Login, Signup, Dashboard)
│   ├── routes/             # Client-side router configuration
│   └── types/              # Frontend TypeScript definitions
├── server/                 # Backend Express TypeScript server
│   ├── src/
│   │   ├── config/         # Database connection configuration
│   │   ├── controllers/    # Route controllers (Auth, User)
│   │   ├── middleware/     # Auth and error handling middlewares
│   │   ├── models/         # Mongoose schemas & models
│   │   ├── routes/         # Express API routes
│   │   ├── utils/          # JWT generation & password utility functions
│   │   └── app.ts          # Express application setup
│   ├── package.json        # Server dependencies and scripts
│   └── tsconfig.json       # Backend TypeScript configuration
├── package.json            # Root configuration and frontend dependencies
├── vercel.json             # Vercel deployment configuration
└── vite.config.ts          # Vite build configuration
```

---

## Environment Variables

### Frontend (`.env`)

```env
VITE_API_BASE_URL=https://your-backend-service.onrender.com
```

### Backend (`server/.env`)

```env
PORT=5000
NODE_ENV=production
CLIENT_URL=https://your-frontend.vercel.app
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
ACCESS_TOKEN_SECRET=your_jwt_access_token_secret
REFRESH_TOKEN_SECRET=your_jwt_refresh_token_secret
ACCESS_TOKEN_EXPIRE=15m
REFRESH_TOKEN_EXPIRE=7d
```

---

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/shotkut-mern-auth.git
cd shotkut-mern-auth
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

### 4. Configure Environment Variables

Create `.env` in the root folder for the frontend, and `server/.env` for the backend, filling in the required values as described above.

### 5. Run Backend Server

```bash
cd server
npm run dev
```

### 6. Run Frontend Application

In a separate terminal window:

```bash
npm run dev
```

---

## Deployment

### Vercel (Frontend)
1. Import the repository into Vercel.
2. Set the Root Directory to `./`.
3. Framework Preset: **Vite**.
4. Set the environment variable: `VITE_API_BASE_URL` pointing to your Render backend URL.

### Render (Backend)
1. Create a new **Web Service** on Render connected to the repository.
2. Set the Root Directory to `server`.
3. Build Command: `npm run build`
4. Start Command: `npm start`
5. Configure Environment Variables (`NODE_ENV`, `CLIENT_URL`, `MONGODB_URI`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, etc.).

---

## Authentication Flow

### Signup
```text
User → Frontend Form → POST /api/auth/signup → Hash Password → Save User to MongoDB → Response (User Data)
```

### Login
```text
User → Frontend Form → POST /api/auth/login → Verify Credentials → Generate Access Token & Refresh Token → Set HTTP-Only Cookie → Response (User + Access Token)
```

### Protected Routes
```text
Frontend Request → Attach Bearer Access Token → Express Middleware Verification → Allow Access / Return Data
```

---

## Future Improvements

- **Email Verification**: Account activation links via SMTP service.
- **Password Reset**: Secure token-based password recovery flow.
- **OAuth Login**: Social authentication with Google and GitHub.
- **Rate Limiting**: Protection against brute-force attacks on login and signup endpoints.
