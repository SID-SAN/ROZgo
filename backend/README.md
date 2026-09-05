# ROZgo Python FastAPI Backend

Universal REST API service for the ROZgo platform powered by **Python FastAPI**, **Supabase** (PostgreSQL & Storage), and configured for zero-downtime deployment on **Render**.

---

## 1. Supabase Setup (5 Minutes)

### Step A: Run SQL Schema
1. Open your project on [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to the **SQL Editor** on the left menu.
3. Click **New Query**, copy the entire contents of [`sql/schema.sql`](./sql/schema.sql), paste it, and click **Run**.
4. This creates all tables (`users`, `worker_profiles`, `employer_profiles`, `service_categories`, `bookings`, `reviews`, `verification_applications`) and seeds initial service categories.

### Step B: Create Storage Buckets
1. Go to **Storage** in the Supabase Dashboard.
2. Click **New Bucket**:
   - **Bucket 1**: Name: `worker-documents` | Make Public: **Disabled (Private)**.
   - **Bucket 2**: Name: `public-media` | Make Public: **Enabled (Public)**.
3. Obtain your credentials from **Project Settings -> API**:
   - `Project URL` (e.g. `https://xyzcompany.supabase.co`)
   - `anon public` key
   - `service_role` secret key

---

## 2. Deploy to Render (5 Minutes)

### Method 1: Blueprint Deploy (Automatic)
1. Push your repository to GitHub / GitLab.
2. In [Render Dashboard](https://dashboard.render.com/), click **New + -> Blueprint**.
3. Select this repository. Render will automatically read [`render.yaml`](./render.yaml) and configure the web service.
4. Input your `SUPABASE_URL`, `SUPABASE_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` when prompted.

### Method 2: Manual Web Service
1. In Render Dashboard, click **New + -> Web Service**.
2. Connect your Git repository.
3. Fill in the service settings:
   - **Name**: `rozgo-backend`
   - **Root Directory**: `backend`
   - **Language / Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: `Free`
4. In the **Environment Variables** section, add:
   - `SUPABASE_URL`: `https://<your-project-ref>.supabase.co`
   - `SUPABASE_KEY`: `<your-supabase-anon-key>`
   - `SUPABASE_SERVICE_ROLE_KEY`: `<your-supabase-service-role-key>`
   - `SUPABASE_BUCKET_DOCUMENTS`: `worker-documents`
   - `SUPABASE_BUCKET_MEDIA`: `public-media`
   - `JWT_SECRET`: `<generate-a-strong-random-key>`
   - `CORS_ORIGIN`: `*`
5. Click **Create Web Service**. Your service will deploy and provide a live URL like `https://rozgo-backend.onrender.com`.

---

## 3. Connect Finalized Frontend (No Code Edits)

Your frontend in `/frontend` is 100% untouched. To connect it to your live Render backend:

- In your frontend hosting platform (Render Static Site, Vercel, Netlify, or local `.env`):
  ```env
  VITE_API_BASE_URL=https://rozgo-backend.onrender.com/api/v1
  ```
- Done! The frontend will now communicate directly with your Render FastAPI backend and Supabase database.

---

## 4. Local Development

```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env with your Supabase keys

uvicorn app.main:app --reload --port 5000
```

- Interactive Swagger Docs: `http://localhost:5000/docs`
- Healthcheck: `http://localhost:5000/api/v1/health`

