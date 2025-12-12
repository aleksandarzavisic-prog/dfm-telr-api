# De Facto Mobili - Wall Deco Quote & Payment API

This API uses **Supabase** (free) for quote storage and **Telr** for payments.

## Setup Instructions

### Step 1: Create Supabase Table

1. Go to **supabase.com** → Your project
2. Click **SQL Editor** in the left sidebar
3. Run this SQL to create the quotes table:

```sql
CREATE TABLE quotes (
    id BIGSERIAL PRIMARY KEY,
    quote_id TEXT UNIQUE NOT NULL,
    quote_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_quotes_quote_id ON quotes(quote_id);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Allow all operations (for simplicity)
CREATE POLICY "Allow all" ON quotes FOR ALL USING (true);
```

4. Click **Run** to execute

### Step 2: Get Supabase Credentials

1. In Supabase, go to **Settings** → **API**
2. Copy:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

### Step 3: Update Vercel Environment Variables

In Vercel dashboard → Your project → **Settings** → **Environment Variables**

Add these variables:
- `SUPABASE_URL` = your project URL (e.g., `https://xxxxx.supabase.co`)
- `SUPABASE_ANON_KEY` = your anon public key
- `TELR_STORE_ID` = 30228
- `TELR_AUTH_KEY` = (your Telr auth key)

### Step 4: Update GitHub Repository

Upload all files from this package to your **dfm-telr-api** repository:

```
api/
  ├── create-payment.js
  ├── save-quote.js
  └── get-quote.js
public/
  ├── calculator.html
  ├── quote.html
  └── Price_List_WallDeco.pdf
package.json
vercel.json
README.md
```

### Step 5: Redeploy

Vercel will auto-deploy when you push to GitHub.

---

## Usage

### Calculator (for salesmen):
```
https://dfm-telr-api.vercel.app/calculator.html
```

### Quote URLs (for clients):
```
https://dfm-telr-api.vercel.app/quote.html?id=DFM-123456
```

---

## API Endpoints

### POST /api/save-quote
Save a quote and get a shareable URL.

### GET /api/get-quote?id=DFM-123456
Retrieve a saved quote.

### POST /api/create-payment
Create a Telr payment link.

---

## Free Tier Limits

**Supabase Free Tier:**
- 500 MB database storage
- Unlimited API requests
- Perfect for thousands of quotes!

**Vercel Free Tier:**
- 100 GB bandwidth
- Unlimited deployments
