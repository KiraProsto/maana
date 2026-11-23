'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyPassword } from '@/app/lib/auth/password';
import { createSession, deleteSession } from '@/app/lib/auth/session';
import { findAdminUser } from '@/app/lib/auth/users';
import {
  isRateLimited,
  registerFailedAttempt,
  resetAttempts,
} from '@/app/lib/auth/rateLimit';

// Хеш-заглушка: проверяем пароль даже для несуществующего логина,
// чтобы по времени ответа нельзя было подобрать логины
const DUMMY_HASH = `${'0'.repeat(32)}:${'0'.repeat(128)}`;

export type LoginResult = { ok: true } | { ok: false; error: string };

export async function login(data: {
  login: string;
  password: string;
}): Promise<LoginResult> {
  const headerList = await headers();
  const ip =
    headerList.get('x-forwarded-for')?.split(',')[0].trim() ||
    headerList.get('x-real-ip') ||
    'unknown';

  if (isRateLimited(ip)) {
    return { ok: false, error: 'Слишком много попыток. Попробуйте через 15 минут' };
  }

  const loginValue = String(data.login || '');
  const password = String(data.password || '');

  if (!loginValue.trim() || !password) {
    return { ok: false, error: 'Введите логин и пароль' };
  }

  const user = findAdminUser(loginValue);
  const isValid = await verifyPassword(
    password,
    user?.passwordHash || DUMMY_HASH,
  );

  if (!user || !isValid) {
    registerFailedAttempt(ip);
    return { ok: false, error: 'Неверный логин или пароль' };
  }

  resetAttempts(ip);
  await createSession(user.login, user.role);
  return { ok: true };
}

export async function logout() {
  await deleteSession();
  redirect('/admin/login');
}
