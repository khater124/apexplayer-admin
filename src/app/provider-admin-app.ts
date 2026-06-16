import cookieParser from 'cookie-parser';
import express, { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { ProviderAdminConfig } from './config.js';
import { query } from './database.js';
import { renderAdminPage } from './admin-page.js';
import {
    listDevices,
    listProviderCodes,
    updateDevicesLastSeen,
    verifyAdminCredentials,
} from './repositories.js';
import { resolveProviderLogin } from './xtream-resolver.js';

const COOKIE_NAME = 'apex_provider_admin';

interface AdminJwtPayload {
    sub: string;
    username: string;
}

type AuthenticatedRequest = Request & {
    admin?: AdminJwtPayload;
};

const providerCodeSchema = z.object({
    code: z
        .string()
        .trim()
        .min(1)
        .max(64)
        .regex(/^[A-Za-z0-9_-]+$/),
    store_name: z.string().trim().min(1).max(180),
    expires_at: z.string().datetime().nullable().optional(),
    notes: z.string().max(2000).nullable().optional(),
});

const providerCodePatchSchema = z.object({
    store_name: z.string().trim().min(1).max(180).optional(),
    is_active: z.boolean().optional(),
    is_blocked: z.boolean().optional(),
    expires_at: z.string().datetime().nullable().optional(),
    notes: z.string().max(2000).nullable().optional(),
});

const hostSchema = z.object({
    host_url: z.string().trim().url().max(2048),
    priority: z.number().int().min(0).max(100000).default(100),
    notes: z.string().max(2000).nullable().optional(),
});

const hostPatchSchema = z.object({
    host_url: z.string().trim().url().max(2048).optional(),
    priority: z.number().int().min(0).max(100000).optional(),
    is_active: z.boolean().optional(),
    notes: z.string().max(2000).nullable().optional(),
});

const devicePatchSchema = z.object({
    is_blocked: z.boolean(),
});

const loginSchema = z.object({
    username: z.string().trim().min(1).max(180),
    password: z.string().min(1).max(500),
});

const appLoginSchema = z.object({
    provider_code: z.string().trim().min(1).max(64),
    username: z.string().trim().min(1).max(180),
    password: z.string().min(1).max(500),
    device_key: z.string().trim().max(64).nullable().optional(),
    mac_address: z.string().trim().max(64).nullable().optional(),
    app_installation_id: z.string().trim().max(128).nullable().optional(),
    app_version: z.string().trim().max(64).nullable().optional(),
});

const deviceCheckSchema = z.object({
    device_key: z.string().trim().max(64).nullable().optional(),
    mac_address: z.string().trim().max(64).nullable().optional(),
    app_installation_id: z.string().trim().max(128).nullable().optional(),
});

function getRequestIp(req: Request): string | null {
    const forwarded = req.headers['x-forwarded-for'];
    const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    const firstForwarded = value?.split(',')[0]?.trim();
    return firstForwarded || req.socket.remoteAddress || null;
}

function requireAdmin(config: ProviderAdminConfig) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const token = req.cookies?.[COOKIE_NAME];
        if (!token) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        try {
            req.admin = jwt.verify(
                token,
                config.sessionSecret
            ) as AdminJwtPayload;
            next();
        } catch {
            res.status(401).json({ error: 'Unauthorized' });
        }
    };
}

function setAuthCookie(
    res: Response,
    config: ProviderAdminConfig,
    payload: AdminJwtPayload
): void {
    const token = jwt.sign(payload, config.sessionSecret, {
        expiresIn: '12h',
    });
    res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        maxAge: 12 * 60 * 60 * 1000,
        sameSite: 'lax',
        secure: config.cookieSecure,
    });
}

function validateBody<TSchema extends z.ZodTypeAny>(schema: TSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ error: 'Invalid request' });
            return;
        }
        req.body = result.data;
        next();
    };
}

function asyncRoute(handler: (req: Request, res: Response) => Promise<void>) {
    return (req: Request, res: Response, next: NextFunction) => {
        handler(req, res).catch(next);
    };
}

function isUuid(value: unknown): value is string {
    if (typeof value !== 'string') {
        return false;
    }

    return Boolean(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            value
        )
    );
}

export function createProviderAdminApp(config: ProviderAdminConfig) {
    const app = express();
    const publicLimiter = rateLimit({
        windowMs: 60 * 1000,
        limit: 30,
        standardHeaders: true,
        legacyHeaders: false,
    });
    const adminLoginLimiter = rateLimit({
        windowMs: 5 * 60 * 1000,
        limit: 20,
        standardHeaders: true,
        legacyHeaders: false,
    });
    const adminOnly = requireAdmin(config);

    app.disable('x-powered-by');
    app.use(express.json({ limit: '32kb' }));
    app.use(cookieParser());

    app.use((req, res, next) => {
        const origin = req.headers.origin;
        if (
            origin &&
            (config.publicCorsOrigins.includes('*') ||
                config.publicCorsOrigins.includes(origin))
        ) {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Vary', 'Origin');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
        }
        if (req.method === 'OPTIONS') {
            res.status(204).end();
            return;
        }
        next();
    });

    app.get('/health', (_req, res) => {
        res.json({ status: 'ok', service: 'apex-provider-admin' });
    });

    app.post(
        '/api/xtream/login',
        publicLimiter,
        validateBody(appLoginSchema),
        asyncRoute(async (req, res) => {
            const body = req.body as z.infer<typeof appLoginSchema>;
            const result = await resolveProviderLogin(
                {
                    providerCode: body.provider_code,
                    username: body.username,
                    password: body.password,
                    deviceKey: body.device_key,
                    macAddress: body.mac_address,
                    appInstallationId: body.app_installation_id,
                    appVersion: body.app_version,
                    ipAddress: getRequestIp(req),
                },
                config
            );

            if (!result.success) {
                res.status(401).json(result);
                return;
            }

            res.json({
                success: true,
                provider_code: result.providerCode,
                resolved_host: result.resolvedHost,
            });
        })
    );

    app.post(
        '/api/device/check',
        publicLimiter,
        validateBody(deviceCheckSchema),
        asyncRoute(async (req, res) => {
            const body = req.body as z.infer<typeof deviceCheckSchema>;
            const devices = await query<{
                id: string;
                is_blocked: boolean;
                code_is_blocked: boolean | null;
                code_is_active: boolean | null;
                code_expires_at: string | null;
            }>(
                `SELECT
                    devices.id,
                    devices.is_blocked,
                    provider_codes.is_blocked AS code_is_blocked,
                    provider_codes.is_active AS code_is_active,
                    provider_codes.expires_at AS code_expires_at
                 FROM devices
                 LEFT JOIN provider_codes ON provider_codes.id = devices.provider_code_id
                 WHERE
                    ($1::text IS NOT NULL AND devices.device_key = $1)
                    OR ($2::text IS NOT NULL AND devices.mac_address = $2)
                    OR ($3::text IS NOT NULL AND devices.app_installation_id = $3)`,
                [
                    body.device_key ?? null,
                    body.mac_address ?? null,
                    body.app_installation_id ?? null,
                ],
                config
            );

            await updateDevicesLastSeen(
                devices.rows.map((device) => device.id),
                config
            );

            const blocked = devices.rows.some((device) => {
                const expired =
                    device.code_expires_at &&
                    Date.parse(device.code_expires_at) <= Date.now();
                return (
                    device.is_blocked ||
                    device.code_is_blocked ||
                    device.code_is_active === false ||
                    Boolean(expired)
                );
            });

            res.json({
                allowed: !blocked,
                status: blocked ? 'blocked' : 'allowed',
            });
        })
    );

    app.get('/admin', (_req, res) => {
        res.type('html').send(renderAdminPage());
    });

    app.get('/admin/api/session', (req: AuthenticatedRequest, res) => {
        const token = req.cookies?.[COOKIE_NAME];
        if (!token) {
            res.json({ authenticated: false });
            return;
        }
        try {
            jwt.verify(token, config.sessionSecret);
            res.json({ authenticated: true });
        } catch {
            res.json({ authenticated: false });
        }
    });

    app.post(
        '/admin/api/login',
        adminLoginLimiter,
        validateBody(loginSchema),
        asyncRoute(async (req, res) => {
            const body = req.body as z.infer<typeof loginSchema>;
            const valid = await verifyAdminCredentials(
                body.username,
                body.password,
                config
            );
            if (!valid) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }

            setAuthCookie(res, config, {
                sub: body.username,
                username: body.username,
            });
            res.json({ authenticated: true });
        })
    );

    app.post('/admin/api/logout', adminOnly, (_req, res) => {
        res.clearCookie(COOKIE_NAME);
        res.json({ success: true });
    });

    app.get(
        '/admin/api/provider-codes',
        adminOnly,
        asyncRoute(async (_req, res) => {
            res.json({ items: await listProviderCodes(config) });
        })
    );

    app.post(
        '/admin/api/provider-codes',
        adminOnly,
        validateBody(providerCodeSchema),
        asyncRoute(async (req, res) => {
            const body = req.body as z.infer<typeof providerCodeSchema>;
            const result = await query(
                `INSERT INTO provider_codes (code, store_name, expires_at, notes)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                [
                    body.code,
                    body.store_name,
                    body.expires_at ?? null,
                    body.notes ?? null,
                ],
                config
            );
            res.status(201).json({ item: result.rows[0] });
        })
    );

    app.patch(
        '/admin/api/provider-codes/:id',
        adminOnly,
        validateBody(providerCodePatchSchema),
        asyncRoute(async (req, res) => {
            if (!isUuid(req.params['id'])) {
                res.status(404).json({ error: 'Not found' });
                return;
            }
            const body = req.body as z.infer<typeof providerCodePatchSchema>;
            const hasExpiresAt = Object.prototype.hasOwnProperty.call(
                body,
                'expires_at'
            );
            const result = await query(
                `UPDATE provider_codes SET
                    store_name = COALESCE($2, store_name),
                    is_active = COALESCE($3, is_active),
                    is_blocked = COALESCE($4, is_blocked),
                    expires_at = CASE WHEN $5 THEN $6 ELSE expires_at END,
                    notes = COALESCE($7, notes)
                 WHERE id = $1
                 RETURNING *`,
                [
                    req.params['id'],
                    body.store_name ?? null,
                    body.is_active ?? null,
                    body.is_blocked ?? null,
                    hasExpiresAt,
                    body.expires_at ?? null,
                    body.notes ?? null,
                ],
                config
            );
            res.json({ item: result.rows[0] });
        })
    );

    app.delete(
        '/admin/api/provider-codes/:id',
        adminOnly,
        asyncRoute(async (req, res) => {
            if (!isUuid(req.params['id'])) {
                res.status(404).json({ error: 'Not found' });
                return;
            }
            await query(
                'DELETE FROM provider_codes WHERE id = $1',
                [req.params['id']],
                config
            );
            res.json({ success: true });
        })
    );

    app.get(
        '/admin/api/provider-codes/:id/hosts',
        adminOnly,
        asyncRoute(async (req, res) => {
            if (!isUuid(req.params['id'])) {
                res.status(404).json({ error: 'Not found' });
                return;
            }
            const result = await query(
                `SELECT * FROM provider_code_hosts
                 WHERE provider_code_id = $1
                 ORDER BY priority ASC, created_at ASC`,
                [req.params['id']],
                config
            );
            res.json({ items: result.rows });
        })
    );

    app.post(
        '/admin/api/provider-codes/:id/hosts',
        adminOnly,
        validateBody(hostSchema),
        asyncRoute(async (req, res) => {
            if (!isUuid(req.params['id'])) {
                res.status(404).json({ error: 'Not found' });
                return;
            }
            const body = req.body as z.infer<typeof hostSchema>;
            const result = await query(
                `INSERT INTO provider_code_hosts (provider_code_id, host_url, priority, notes)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                [
                    req.params['id'],
                    body.host_url,
                    body.priority,
                    body.notes ?? null,
                ],
                config
            );
            res.status(201).json({ item: result.rows[0] });
        })
    );

    app.patch(
        '/admin/api/hosts/:id',
        adminOnly,
        validateBody(hostPatchSchema),
        asyncRoute(async (req, res) => {
            if (!isUuid(req.params['id'])) {
                res.status(404).json({ error: 'Not found' });
                return;
            }
            const body = req.body as z.infer<typeof hostPatchSchema>;
            const result = await query(
                `UPDATE provider_code_hosts SET
                    host_url = COALESCE($2, host_url),
                    priority = COALESCE($3, priority),
                    is_active = COALESCE($4, is_active),
                    notes = COALESCE($5, notes)
                 WHERE id = $1
                 RETURNING *`,
                [
                    req.params['id'],
                    body.host_url ?? null,
                    body.priority ?? null,
                    body.is_active ?? null,
                    body.notes ?? null,
                ],
                config
            );
            res.json({ item: result.rows[0] });
        })
    );

    app.delete(
        '/admin/api/hosts/:id',
        adminOnly,
        asyncRoute(async (req, res) => {
            if (!isUuid(req.params['id'])) {
                res.status(404).json({ error: 'Not found' });
                return;
            }
            await query(
                'DELETE FROM provider_code_hosts WHERE id = $1',
                [req.params['id']],
                config
            );
            res.json({ success: true });
        })
    );

    app.get(
        '/admin/api/devices',
        adminOnly,
        asyncRoute(async (_req, res) => {
            res.json({ items: await listDevices(config) });
        })
    );

    app.get(
        '/admin/api/provider-codes/:id/devices',
        adminOnly,
        asyncRoute(async (req, res) => {
            if (!isUuid(req.params['id'])) {
                res.status(404).json({ error: 'Not found' });
                return;
            }
            res.json({ items: await listDevices(config, req.params['id']) });
        })
    );

    app.patch(
        '/admin/api/devices/:id',
        adminOnly,
        validateBody(devicePatchSchema),
        asyncRoute(async (req, res) => {
            if (!isUuid(req.params['id'])) {
                res.status(404).json({ error: 'Not found' });
                return;
            }
            const body = req.body as z.infer<typeof devicePatchSchema>;
            const result = await query(
                `UPDATE devices SET is_blocked = $2 WHERE id = $1 RETURNING *`,
                [req.params['id'], body.is_blocked],
                config
            );
            res.json({ item: result.rows[0] });
        })
    );

    app.delete(
        '/admin/api/devices/:id',
        adminOnly,
        asyncRoute(async (req, res) => {
            if (!isUuid(req.params['id'])) {
                res.status(404).json({ error: 'Not found' });
                return;
            }
            await query(
                'DELETE FROM devices WHERE id = $1',
                [req.params['id']],
                config
            );
            res.json({ success: true });
        })
    );

    app.use((_req, res) => {
        res.status(404).json({ error: 'Not found' });
    });

    app.use(
        (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
            const message =
                error instanceof Error ? error.message : String(error);
            console.error(`Provider admin request failed: ${message}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    );

    return app;
}
