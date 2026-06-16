# Apex Provider Admin

Lightweight Express + PostgreSQL admin panel for resolving customer-facing provider codes into hidden Xtream hosts.

## Required Environment Variables

```text
DATABASE_URL=postgresql://...
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-me
ADMIN_JWT_SECRET=long-random-secret
```

Optional:

```text
SESSION_SECRET=alternative-to-ADMIN_JWT_SECRET
DATA_ENCRYPTION_KEY=long-random-secret-for-device-password-encryption
APP_CORS_ORIGINS=*
RUN_MIGRATIONS_ON_START=true
XTREAM_HOST_TIMEOUT_MS=2500
COOKIE_SECURE=true
```

`DATA_ENCRYPTION_KEY` is optional. If it is not set, the app uses the session/JWT secret to encrypt stored device passwords.

## Local Development

```bash
npm install
npm run migrate
npm run dev
```

Open:

```text
http://localhost:3334/admin
```

## Railway Deployment

1. Create a PostgreSQL database in Railway.
2. Add the required environment variables above.
3. Use the root `railway.json` build/start commands, or set them manually:

```bash
npm run build
npm start
```

4. Run migrations once:

```bash
npm run migrate
```

Alternatively set:

```text
RUN_MIGRATIONS_ON_START=true
```

After Railway gives you the public backend URL, configure the Windows app to
use it through one of these app-side values:

```text
APEX_PROVIDER_API_URL=https://your-railway-service.up.railway.app
IPTVNATOR_PROVIDER_API_URL=https://your-railway-service.up.railway.app
```

## Public App API

```http
POST /api/xtream/login
```

```json
{
    "provider_code": "557",
    "username": "user123",
    "password": "pass123",
    "device_key": "123456",
    "mac_address": "CO:35:32:30:A7:53",
    "app_installation_id": "...",
    "app_version": "0.22.0"
}
```

All invalid provider-code, blocked, expired, wrong username/password, or host-failure cases return the same public error:

```json
{ "success": false, "error": "Invalid credentials" }
```

```http
POST /api/device/check
```

Returns whether the device is currently allowed.

## Notes

- The backend does not store channel/movie/series metadata.
- The backend does not proxy streams.
- The backend does not proxy images.
- The desktop app still needs the resolved host internally for direct Xtream playback URLs, but the UI should display only the provider code.
