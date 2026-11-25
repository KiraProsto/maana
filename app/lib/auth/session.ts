import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  decodeSession,
  encodeSession,
} from './token';
import type { AdminRole } from './users';

export async function createSession(login: string, role: AdminRole) {
  const token = encodeSession({
    login,
    role,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession() {
  const cookieStore = await cookies();
  return decodeSession(cookieStore.get(SESSION_COOKIE)?.value);
}

// Проверка на сервере для страниц и server actions админки.
// Proxy делает только быстрый редирект, полагаться лишь на него нельзя
export async function verifySession() {
  const session = await getSession();
  if (!session) redirect('/admin/login');
  return session;
}
