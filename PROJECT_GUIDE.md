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
    *   `/api/activity`: Logs and retrieves user activity.
    *   `/api/goals`: Manages sustainability goals.
    *   `/api/data`: Configurable data management endpoints.
    *   `/api/reports`: Handles report generation and history.

### `/components`
Reusable UI components organized by domain.

*   **`/ui`**: Core design elements (Buttons, Cards, Inputs, etc.) built with Shadcn UI.
*   **`/dashboard`**: Components specific to the dashboard experience.
    *   `/layout`: Sidebar, UserNav, MobileSidebar.
    *   `/ai`: Chat interface and AI visualization components.
*   **`/shared`**: Components used across the entire application (Logo, Splash Screen, Providers).
*   **`/auth`**: Authentication-specific components.

### `/lib`
Core logic, utilities, and configuration.

*   **`/auth`**: Authentication configuration.
    *   `options.ts`: NextAuth configuration strings and callbacks.
    *   `index.ts`: JWT utility functions.
*   **`/db`**: Database connectivity.
    *   `index.ts`: MongoDB connection logic (Mongoose).
    *   `cache.ts`: Simple in-memory caching utility.
*   **`/ai`**: AI integration logic.
    *   `openaiService.ts`: OpenAI API wrapper.
    *   `fallbackData.ts`: Mock data for offline/fallback modes.
*   **`/utils`**: General utility functions.
    *   `index.ts`: Class merging utility (`cn`).
    *   `pdf-generator.ts`: Report generation logic.
    *   `activity.ts`: Activity logging utilities.
*   **`/hooks`**: Custom React hooks (e.g., `useCountUp`).
*   **`/types`**: TypeScript type definitions.

### `/models`
Database schemas (Mongoose).

*   **`User.ts`**: Defines the user data structure.
*   **`Calculation.ts`**: Stores emission calculation records.
*   **`Goal.ts`**: Tracks sustainability goals.
*   **`Report.ts`**: Stores generated reports.
*   **`Activity.ts`**: Logs user actions for audit trails.
*   **`AIAnalysis.ts`**: Caches AI-generated insights.

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
*   **PDF Generation**: jsPDF + autoTable.
