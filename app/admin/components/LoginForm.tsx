'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import styles from '../admin.module.css';
import { login } from '../actions';

type FormData = {
  login: string;
  password: string;
};

export default function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setServerError(null);

    try {
      const result = await login(data);

      if (result.ok) {
        router.replace('/admin');
        router.refresh();
      } else {
        setServerError(result.error);
      }
    } catch {
      setServerError('Что-то пошло не так');
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={styles.loginForm}
      aria-label="Форма входа в админ-панель"
      noValidate>
      <input
        id="login"
        type="text"
        placeholder="Логин"
        className={errors.login ? styles.inputError : ''}
        autoComplete="username"
        {...register('login', { required: 'Введите логин' })}
      />
      {errors.login && (
        <span className={styles.errorMsg}>{errors.login.message}</span>
      )}

      <input
        id="password"
        type="password"
        placeholder="Пароль"
        className={errors.password ? styles.inputError : ''}
        autoComplete="current-password"
        {...register('password', { required: 'Введите пароль' })}
      />
      {errors.password && (
        <span className={styles.errorMsg}>{errors.password.message}</span>
      )}

      {serverError && (
        <span className={styles.errorMsg} role="alert">
          {serverError}
        </span>
      )}

      <button
        className={styles.loginBtn}
        type="submit"
        disabled={isSubmitting}
        aria-label="Войти в админ-панель">
        {isSubmitting ? 'Входим…' : 'Войти'}
      </button>
    </form>
  );
}
