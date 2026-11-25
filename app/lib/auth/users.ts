import 'server-only';

export type AdminRole = 'developer' | 'admin';

export type AdminUser = {
  login: string;
  passwordHash: string;
  role: AdminRole;
};

// Пользователей всего двое, поэтому храним их в переменных окружения,
// а не в открытой регистрации
export function getAdminUsers(): AdminUser[] {
  const users: AdminUser[] = [
    {
      login: process.env.ADMIN_DEVELOPER_LOGIN || '',
      passwordHash: process.env.ADMIN_DEVELOPER_PASSWORD_HASH || '',
      role: 'developer',
    },
    {
      login: process.env.ADMIN_OWNER_LOGIN || '',
      passwordHash: process.env.ADMIN_OWNER_PASSWORD_HASH || '',
      role: 'admin',
    },
  ];

  return users.filter((u) => u.login && u.passwordHash);
}

export function findAdminUser(login: string): AdminUser | undefined {
  const normalized = login.trim().toLowerCase();
  return getAdminUsers().find((u) => u.login.toLowerCase() === normalized);
}
