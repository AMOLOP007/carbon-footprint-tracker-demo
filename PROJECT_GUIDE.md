# Aetherra - Project Structure Guide

## 📂 Folder Structure

### `/app`
This is the main directory for the application's frontend pages and backend API routes (Next.js App Router).

*   **`/(auth)`**: Contains authentication pages (`/login`, `/register`). The parenthesis `()` mean this folder doesn't affect the URL path.
*   **`/(dashboard)`**: Contains the main protected application pages (`/overview`, `/calculator`, `/insights`, etc.).
*   **`/api`**: Contains backend API endpoints.
    *   `/api/auth/[...nextauth]`: Handles authentication (Login/Register/OAuth).
    *   `/api/calculator`: Handles carbon footprint calculations.
    *   `/api/dashboard`: Fetches real-time dashboard data.
    *   `/api/insights`: AI-powered sustainability insights.
*   **`/splash`**: The introductory landing page content.

### `/components`
Reusable UI components.

*   **`/ui`**: Core design elements (Buttons, Cards, Inputs, etc.) built with Shadcn UI.
*   **`/layout`**: Layout components like `Sidebar`, `UserNav`, and `MobileSidebar`.
*   **`theme-provider.tsx`**: Manages light/dark mode (if applicable).
*   **`providers.tsx`**: Wraps the app with context providers (Auth, Theme, etc.).

### `/lib`
Helper functions and utilities.

*   **`db.ts`**: Connects to the MongoDB database.
*   **`mongoose.ts`**: Legacy database connection file (kept for compatibility).
*   **`utils.ts`**: General utility functions for styling and classes.
*   **`openai.ts`**: wrapper for AI integration (if present).

### `/models`
Database schemas (Mongoose).

*   **`User.ts`**: Defines the user data structure (Name, Email, Password, Role).
*   **`Calculation.ts`**: Defines usage data structure (Type, Emissions, Input Data).
*   **`Goal.ts`**: Defines sustainability goals.

### `/public`
Static assets like images, icons, and fonts.

---

## 🔑 Key Files

*   **`.env.local`**: (NOT IN GIT) Stores sensitive passwords and API keys.
*   **`middleware.ts`**: Protects routes. It checks if you are logged in before letting you access the dashboard.
*   **`next.config.js`**: Configuration settings for the Next.js framework.
*   **`package.json`**: Lists all the libraries and tools the project uses.

---

## 🛠 Tech Stack

*   **Framework**: Next.js 14+ (App Router)
*   **Database**: MongoDB (via Mongoose)
*   **Authentication**: NextAuth.js (v4)
*   **UI Library**: Shadcn UI + Tailwind CSS
*   **Animation**: Framer Motion
*   **AI**: OpenAI (GPT-4o) integration for insights.
