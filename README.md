# 🏪 DukaanSetu - Backend API

This is the backend service for the **DukaanSetu** marketplace. It is built with Node.js and Express, and is designed to run as a serverless function on Vercel. 

Its primary responsibility is securely powering the **AI Catalog Feature** for retailers using Google's Gemini AI.

## 🛠️ Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **AI Integration:** `@google/genai` (Gemini 3.6 Flash)
* **File Uploads:** Multer (Memory Storage)
* **Hosting:** Vercel Serverless Functions

## 🔌 API Endpoints

### `POST /api/ai/catalog`
Processes a raw image of a grocery product and returns structured data.
* **Content-Type:** `multipart/form-data`
* **Body:** `image` (File)
* **Response:**
  ```json
  {
    "name": "Tata Salt",
    "brand": "Tata",
    "category": "Staples",
    "packSize": "1 kg",
    "description": "Iodized salt for everyday cooking."
  }
  ```

## 💻 Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Piyush0804-hub/dukaansetu-backend.git
   cd dukaansetu-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory. You will need your Supabase and Gemini API keys:
   ```env
   PORT=5000
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start the local server:**
   ```bash
   node server.js
   ```
   The server will run on `http://localhost:5000`.

## 🌐 Live Deployment
This backend is fully configured for Vercel deployment via the `vercel.json` file.
* **Production URL:** [https://dukaan-setu-backend.vercel.app](https://dukaan-setu-backend.vercel.app)
