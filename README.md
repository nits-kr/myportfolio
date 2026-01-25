# Portfolio Project

This project consists of a separate **Frontend** (Next.js) and **Backend** (Node.js/Express).

## Folder Structure

- `frontend/`: The Next.js client application.
- `backend/`: The Node.js/Express API server.

## Deployment Guide

### 1. Deploying the Backend

You can deploy the backend to services like **Render**, **Heroku**, or **Railway**.

**Environment Variables Required:**

- `PORT`: (Optional, defaults to 5000)
- `MONGODB_URI`: Your MongoDB connection string.
- `JWT_SECRET`: Secret key for JWT tokens.
- `CORS_ORIGIN`: The URL of your deployed frontend (e.g., `https://my-portfolio-frontend.vercel.app`).

### 2. Deploying the Frontend

You can deploy the frontend to **Vercel** or **Netlify**.

1.  Push this entire repository to GitHub.
2.  Import the project in Vercel.
3.  **Important:** Configure the **Root Directory** settings in Vercel to point to `frontend`.
4.  **Environment Variables Required:**
    - `NEXT_PUBLIC_API_URL`: The full URL of your deployed backend + `/api` (e.g., `https://my-portfolio-backend.onrender.com/api`).

## Local Development

1.  **Backend:**

    ```bash
    cd backend
    npm install
    # Create .env file with MONGODB_URI and JWT_SECRET
    npm run dev
    ```

2.  **Frontend:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
