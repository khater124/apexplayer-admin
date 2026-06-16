import {
    createCipheriv,
    createDecipheriv,
    createHash,
    randomBytes,
} from 'node:crypto';

const VERSION = 'v1';

function getKey(secret: string): Buffer {
    return createHash('sha256').update(secret).digest();
}

export function encryptText(value: string, secret: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', getKey(secret), iv);
    const encrypted = Buffer.concat([
        cipher.update(value, 'utf8'),
        cipher.final(),
    ]);
    const tag = cipher.getAuthTag();

    return [
        VERSION,
        iv.toString('base64url'),
        tag.toString('base64url'),
        encrypted.toString('base64url'),
    ].join(':');
}

export function decryptText(value: string | null, secret: string): string {
    if (!value) {
        return '';
    }

    const [version, ivValue, tagValue, encryptedValue] = value.split(':');
    if (version !== VERSION || !ivValue || !tagValue || !encryptedValue) {
        return '';
    }

    try {
        const decipher = createDecipheriv(
            'aes-256-gcm',
            getKey(secret),
            Buffer.from(ivValue, 'base64url')
        );
        decipher.setAuthTag(Buffer.from(tagValue, 'base64url'));
        return Buffer.concat([
            decipher.update(Buffer.from(encryptedValue, 'base64url')),
            decipher.final(),
        ]).toString('utf8');
    } catch {
        return '';
    }
}
