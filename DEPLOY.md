# Deploy ApexPlayer Admin Panel Online

**No credit card?** Use **Railway** instead – see [DEPLOY-RAILWAY.md](DEPLOY-RAILWAY.md)

**Fly.io:** Your brother can access it at: **https://your-app-name.fly.dev**

---

## Step 1: Install Fly.io CLI

**Windows (PowerShell):**
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

**Or download:** https://fly.io/docs/hands-on/install-flyctl/

---

## Step 2: Sign Up & Login

1. Create free account: https://fly.io/app/sign-up
2. Login (opens browser):
```powershell
$env:Path += ";D:\Wpf_Fish\ApexPlayer\ApexPlayerPanel\bin"
flyctl auth login
```

---

## Step 3: Deploy

Open PowerShell in the **ApexPlayerPanel** folder:

```powershell
cd "D:\Wpf_Fish\ApexPlayer\ApexPlayerPanel"
$env:Path += ";D:\Wpf_Fish\ApexPlayer\ApexPlayerPanel\bin"
flyctl launch
```

When prompted:
- **App name:** Choose a unique name (e.g. `apexplayer-yourname`) or press Enter for auto
- **Region:** Pick closest to you (e.g. `ams` for Amsterdam, `iad` for Virginia)
- **Create volume?** Type **yes** (important – keeps users & devices data)
- **Volume name:** `apexplayer_data` or press Enter

Then deploy:
```powershell
flyctl deploy
```

*(First deploy may take 2–3 minutes)*

---

## Step 4: Get Your URL

After deploy finishes, you'll see:
```
https://apexplayer-yourname.fly.dev
```

**Send this URL to your brother** – he can open it on any device (PC, phone, tablet).

---

## Step 5: First Login

- **Username:** `admin`
- **Password:** `admin123`

**Important:** Change the password in Settings after first login!

---

## Update / Redeploy

When you make changes:
```powershell
cd "D:\Wpf_Fish\ApexPlayer\ApexPlayerPanel"
flyctl deploy
```

---

## Troubleshooting

**Check status:**
```powershell
flyctl status
```

**View logs:**
```powershell
flyctl logs
```

**Open app in browser:**
```powershell
flyctl open
```
