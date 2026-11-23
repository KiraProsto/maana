// Генерирует хеш пароля для ADMIN_*_PASSWORD_HASH в .env
// Запуск: npm run hash-password
import { randomBytes, scrypt } from 'crypto';
import { createInterface } from 'readline';

const rl = createInterface({ input: process.stdin, output: process.stdout });

rl.question('Пароль (мин. 12 символов): ', (password) => {
  rl.close();

  if (password.length < 12) {
    console.error('Пароль слишком короткий');
    process.exit(1);
  }

  const salt = randomBytes(16);
  scrypt(password, salt, 64, (err, hash) => {
    if (err) throw err;
    console.log(`\n${salt.toString('hex')}:${hash.toString('hex')}`);
  });
});
