import { createHmac, timingSafeEqual } from 'crypto';
import type { AdminRole } from './users';

export type SessionPayload = {
  login: string;
  role: AdminRole;
  exp: number;
};

export const SESSION_COOKIE = 'maana_admin_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET не задан или короче 32 символов');
  }
  return secret;
}

function sign(data: string): string {
  return createHmac('sha256', getSecret()).update(data).digest('base64url');
}

export function encodeSession(payload: SessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${data}.${sign(data)}`;
}

export function decodeSession(token?: string): SessionPayload | null {
  if (!token) return null;

  const [data, signature] = token.split('.');
  if (!data || !signature) return null;

  try {
    const expected = Buffer.from(sign(data));
    const actual = Buffer.from(signature);
    if (
      expected.length !== actual.length ||
      !timingSafeEqual(expected, actual)
    ) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(data, 'base64url').toString('utf-8'),
    ) as SessionPayload;

    if (payload.exp < Date.now() / 1000) return null;
    return payload;
  } catch {
    return null;
  }
}
