# Deploy ApexPlayer Admin Panel on Railway (No Card Required)

Railway gives **$5 free credits/month** – no credit card needed to start.

---

## Step 1: Sign Up

1. Go to **https://railway.app**
2. Click **Login** → **Sign up with GitHub** (or Google)
3. No credit card required for the trial

---

## Step 2: Create New Project

1. Click **New Project**
2. Choose **Deploy from GitHub repo**
3. If prompted, connect your GitHub account
4. Select your repo (push ApexPlayerPanel code first if needed)
5. **Important:** In service settings, set **Root Directory** to `ApexPlayerPanel` (so Railway builds from that folder)

**Don't have it on GitHub yet?** Use **Deploy from local** instead – see Step 2b below.

---

## Step 2b: Deploy from Local (without GitHub)

1. Install Railway CLI:
   ```powershell
   iwr https://railway.app/install.ps1 -useb | iex
   ```

2. Login:
   ```powershell
   railway login
   ```

3. In the ApexPlayerPanel folder:
   ```powershell
   cd "D:\Wpf_Fish\ApexPlayer\ApexPlayerPanel"
   railway init
   railway up
   ```

4. Add a volume in the Railway dashboard (see Step 3).

---

## Step 3: Add Persistent Storage (Important)

1. In your Railway project, click your **service**
2. Go to **Variables** tab
3. Click **+ New** → **Volume**
4. Name it: `apexplayer_data`
5. **Mount path:** `/app/Data`
6. Click **Add**

This keeps your users and devices data when you redeploy.

---

## Step 4: Generate Domain

1. Click your service
2. Go to **Settings** tab
3. Under **Networking** → **Public Networking**, click **Generate Domain**
4. You'll get a URL like: `apexplayer-admin-production-xxxx.up.railway.app`

**Share this URL with your brother** – he can open it on any device.

---

## Step 5: First Login

- **Username:** `admin`
- **Password:** `admin123`

**Change the password in Settings after first login!**

---

## Redeploy (when you make changes)

**If using GitHub:** Push your code – Railway auto-deploys.

**If using CLI:**
```powershell
cd "D:\Wpf_Fish\ApexPlayer\ApexPlayerPanel"
railway up
```
