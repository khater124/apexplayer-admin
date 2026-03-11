# Push Admin Panel to GitHub

Git is installed at **D:\Wpf_Fish\Git**. The repo is ready – you just need to create the GitHub repo and push.

---

## Step 1: Create repo on GitHub

1. Go to **https://github.com/new**
2. **Repository name:** `apexplayer-admin` (or any name)
3. **Public**
4. **Do NOT** add README, .gitignore, or license (we already have them)
5. Click **Create repository**

---

## Step 2: Push from PowerShell

Replace `YOUR_USERNAME` with your GitHub username:

```powershell
cd "D:\Wpf_Fish\ApexPlayer\ApexPlayerPanel"
$env:Path = "D:\Wpf_Fish\Git\cmd;" + $env:Path
git remote add origin https://github.com/YOUR_USERNAME/apexplayer-admin.git
git branch -M main
git push -u origin main
```

When prompted for credentials, use your GitHub username and a **Personal Access Token** (not your password).

**Create a token:** GitHub → Settings → Developer settings → Personal access tokens → Generate new token (classic) → enable `repo` scope.
