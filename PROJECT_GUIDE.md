# Aetherra Project Guide 🌍

Welcome to **Aetherra**! This is a modern, sustainability-focused web application designed to help businesses track and reduce their carbon footprint. This guide will help you understand how the project is structured and how to run it.

---

## 📂 Project Structure

Here is a simple explanation of the main folders and what they do:

### `app/`
This is the heart of the application. In Next.js (the framework we use), the folder structure here determines the website URLs.
- **`(auth)/`**: Contains pages for Login (`/login`) and Registration (`/register`). They share a common "Authentication" layout.
- **`(dashboard)/`**: Contains the main app pages accessible after logging in, like the Dashboard, Calculator, and Reports.
- **`api/`**: These are the "backend" routes. They handle data saving, user authentication, and AI processing.
- **`gate/`** (Removed): Previously used for password protection, now cleaned up.
- **`layout.tsx`**: The main wrapper for the entire website.
- **`page.tsx`**: The home page (Dashboard).
- **`globals.css`**: The main style definitions.

### `components/`
These are the building blocks of the UI.
- **`layout/`**: Big structural pieces like the Sidebar and Animated Backgrounds.
- **`ui/`**: Small, reusable pieces like Buttons, Cards, Inputs, and Dialogs.
- **`reports/`**: Components specifically for generating PDF reports.

### `lib/`
Helper functions and logic that run behind the scenes.
- **`db.ts`**: Handles the connection to the MongoDB database.
- **`auth.ts`**: Tools for managing user sessions and security tokens.
- **`pdf-generator.ts`**: The logic that creates the downloadable PDF reports.
- **`utils.ts`**: Small helper functions for styling.

### `models/`
Defines the structure of our data (Database Schemas).
- **`User.ts`**: Defines what a "User" looks like (name, email, password, etc.).
- **`Calculation.ts`**: Defines how carbon calculation data is stored.

---

## 🔑 Key Features Mapping

- **Authentication**: Handled by `app/api/auth/` (NextAuth.js) and `app/(auth)/`.
- **Database**: The connection is managed in `lib/db.ts`. Real user data is stored in MongoDB.
- **Carbon Calculator**: The logic lives in `app/(dashboard)/calculator/page.tsx` and saves data via `app/api/calculator/route.ts`.
- **AI Assistant**: powered by `app/api/chat/route.ts`.
- **PDF Reports**: Generated client-side using `lib/pdf-generator.ts`.

---

## 🚀 Beginner Setup Guide

Follow these steps exactly to get the project running on your own computer.

### 1. Required Apps
You need to install these three free tools first:

*   **Node.js** (The engine that runs the code)
    *   Download: [https://nodejs.org/en/download/](https://nodejs.org/en/download/)
    *   *Tip: Choose the "LTS" (Long Term Support) version.*
*   **Git** (The tool to download the project)
    *   Download: [https://git-scm.com/downloads](https://git-scm.com/downloads)
*   **Google Chrome** (Recommended Browser)
    *   Download: [https://www.google.com/chrome/](https://www.google.com/chrome/)

### 2. Download Project
1.  Open your **Terminal** (Command Prompt on Windows, Terminal on Mac).
2.  Run this command to download the code:
    ```bash
    git clone https://github.com/AMOLOP007/carbon-footprint-tracker-demo.git
    ```
    *(This is the official repository)*
3.  Enter the project folder:
    ```bash
    cd aetherra
    ```

### 3. Install Dependencies
This step downloads all the code libraries the project needs.
1.  In your terminal (inside the `aetherra` folder), run:
    ```bash
    npm install --legacy-peer-deps
    ```
    *Wait for it to finish. It might take a minute or two.*

### 4. Create Environment File
1.  Create a file named `.env.local` in the main folder.
2.  Add this content (ask your admin for real keys):
    ```env
    MONGODB_URI=mongodb://127.0.0.1:27017/aetherra
    JWT_SECRET=super-secret-key
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=random-secret-string
    ```

### 5. Run the Project
1.  Start the development server:
    ```bash
    npm run dev
    ```
2.  Open your browser and go to:
    👉 **http://localhost:3000**

---

## ☁️ Deployment (Temporary Public URL)

To share the project with teammates without them installing anything:

1.  Open a new terminal window in the project folder.
2.  Run:
    ```bash
    npx -y tunnelmole 3000
    ```
3.  Copy the `https://....tunnelmole.net` link shown in the terminal.
4.  Share that link! Anyone can access it.
    *   **Note**: Social Logins (Google/Apple) require specific configuration to work on this random URL. See `task.md` for details if needed.

---

## 📊 Database & User Analytics
To check how many users have signed up:

**Method 1: Database (Recommended)**
Use a tool like [MongoDB Compass](https://www.mongodb.com/products/tools/compass) to connect to your database string. You can view the `users` collection directly.

**Method 2: Admin API**
Visit this hidden link in your browser (requires Admin login):
`http://localhost:3000/api/admin/stats`
*(Returns a simple JSON showing user count and recent activity)*
