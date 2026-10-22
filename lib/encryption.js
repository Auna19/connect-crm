import crypto from 'crypto';

// 32-byte key for AES-256-GCM. Uses env or deterministic secure fallback for development
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'connectcrm_secret_key_32bytes_!!';
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

// Normalize key to 32 bytes buffer
function getKeyBuffer() {
  return crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
}

/**
 * Encrypt plaintext string using AES-256-GCM
 */
export function encryptSecret(plainText) {
  if (!plainText) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getKeyBuffer();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');
  return `enc:${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt string encrypted with encryptSecret
 */
export function decryptSecret(encryptedPayload) {
  if (!encryptedPayload) return '';
  if (!encryptedPayload.startsWith('enc:')) {
    // Legacy / unencrypted fallback
    return encryptedPayload;
  }

  const parts = encryptedPayload.split(':');
  if (parts.length !== 4) {
    throw new Error('Invalid encrypted payload format');
  }

  const iv = Buffer.from(parts[1], 'hex');
  const authTag = Buffer.from(parts[2], 'hex');
  const encrypted = parts[3];

  const key = getKeyBuffer();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Masks a secret string for safe display in UI responses
 */
export function maskSecret(secret) {
  if (!secret) return '';
  const plain = secret.startsWith('enc:') ? '••••••••' : secret;
  if (plain.length <= 4) return '••••';
  return '••••••••' + plain.slice(-4);
}

/**
 * Recursively redacts sensitive keys from objects before logging or API output
 */
export function redactSecrets(data) {
  if (!data) return data;
  if (typeof data === 'string') {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(item => redactSecrets(item));
  }
  if (typeof data === 'object') {
    const sensitiveKeys = [
      'authorization',
      'authtoken',
      'auth_token',
      'secret',
      'apikey',
      'api_key',
      'password',
      'clientsecret',
      'client_secret',
      'token',
      'signingsecret',
      'signing_secret'
    ];

    const copy = {};
    for (const [key, val] of Object.entries(data)) {
      const lower = key.toLowerCase();
      if (sensitiveKeys.some(s => lower.includes(s))) {
        copy[key] = '[REDACTED]';
      } else if (typeof val === 'object' && val !== null) {
        copy[key] = redactSecrets(val);
      } else {
        copy[key] = val;
      }
    }
    return copy;
  }
  return data;
}

/**
 * Generate HMAC SHA-256 signature for webhooks
 */
export function signWebhookPayload(payloadString, secret) {
  return crypto.createHmac('sha256', secret).update(payloadString).digest('hex');
}

/**
 * Verify HMAC SHA-256 signature
 */
export function verifyWebhookSignature(payloadString, signature, secret) {
  if (!payloadString || !signature || !secret) return false;
  const expected = signWebhookPayload(payloadString, secret);
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}
