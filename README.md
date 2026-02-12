# Aetherra - Sustainability Intelligence Platform

Welcome to **Aetherra**! This is a modern web application designed to help users track, analyze, and reduce their carbon footprint.

## 📋 Section 1 — Required Installations

Before you start, make sure you have the following installed:

1.  **Node.js (LTS Version)**
    *   Download and install from: https://nodejs.org/
    *   This is required to run the JavaScript code.

2.  **MongoDB (Community Server)**
    *   Download and install from: https://www.mongodb.com/try/download/community
    *   This is the database where your data will be saved.

3.  **VS Code (Visual Studio Code)**
    *   Download from: https://code.visualstudio.com/
    *   This is the code editor we recommend.

---

## 🚀 Section 2 — How to Download Project from GitHub

1.  **Install Git** (if you haven't already):
    *   Download from: https://git-scm.com/downloads

2.  **Open VS Code**.

3.  **Open the Terminal**:
    *   Go to the top menu: `Terminal` -> `New Terminal`.

4.  **Download the Code**:
    *   Type the following command and press Enter:
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    ```

5.  **Navigate into the Project**:
    ```bash
    cd your-repo-name
    ```

---

## 📦 Section 3 — Install Dependencies

Install all the software libraries required by the project by running this command:

```bash
npm install
```

*This might take a minute or two as it downloads everything.*

---

## 🔐 Section 4 — Create Env File

You need to create a special configuration file for your secret passwords (API keys).

1.  Create a new file in the main folder named: `.env.local`
2.  Open `.env.local` and paste the following template:

```env
# Database Connection
MONGODB_URI=mongodb://127.0.0.1:27017/aetherra

# Authentication Secrets (Generate random strings for these)
NEXTAUTH_SECRET=changeme_to_a_random_secure_string
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=changeme_to_another_random_secret

# Google OAuth (Required for Google Login)
# Get these from: https://console.cloud.google.com/
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**Important:** Replace `your_google_client_id` and `your_google_client_secret` with actual keys if you want Google Login to work.

---

## ▶️ Section 5 — Run Project

To start the application, run:

```bash
npm run dev
```

Once it says "Ready", open your browser and go to:
**http://localhost:3000**

---

## 🛠 Section 6 — Troubleshooting

*   **Error: "connect ECONNREFUSED 127.0.0.1:27017"**
    *   **Fix:** Your MongoDB is not running. Search for "MongoDB Compass" or "MongoDB Service" on your computer and start it.

*   **Error: "Missing MONGODB_URI"**
    *   **Fix:** You forgot to create the `.env.local` file or didn't save it.

*   **Google Login Error: "redirect_uri_mismatch"**
    *   **Fix:** In your Google Cloud Console, make sure "Authorized redirect URIs" includes: `http://localhost:3000/api/auth/callback/google`.

---

**Happy Coding!** 🌍🌱
