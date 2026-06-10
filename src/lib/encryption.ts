import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

function getKey(): Buffer {
  const raw = process.env.PAYMENT_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error('PAYMENT_ENCRYPTION_KEY is not configured');
  }
  const key = Buffer.from(raw, 'hex');
  if (key.length !== 32) {
    throw new Error('PAYMENT_ENCRYPTION_KEY must be 32 bytes (64 hex chars)');
  }
  return key;
}

export function isEncryptionConfigured(): boolean {
  const raw = process.env.PAYMENT_ENCRYPTION_KEY;
  return Boolean(raw) && Buffer.from(raw as string, 'hex').length === 32;
}

export function encryptSecret(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [
    iv.toString('base64'),
    tag.toString('base64'),
    ciphertext.toString('base64'),
  ].join('.');
}

export function decryptSecret(payload: string): string {
  const key = getKey();
  const [ivB64, tagB64, ciphertextB64] = payload.split('.');
  if (!ivB64 || !tagB64 || !ciphertextB64) {
    throw new Error('Invalid encrypted payload');
  }
  const decipher = createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(ivB64, 'base64')
  );
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextB64, 'base64')),
    decipher.final(),
  ]).toString('utf8');
}
