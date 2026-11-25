'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, useTransition } from 'react';
import type { FormEvent } from 'react';
import { formatRubles } from '@/app/lib/catalog/price';
import { changeProducts, restoreProducts } from '../product-actions';
import { productStatuses } from '../product-statuses';
import type { AdminProduct } from '../products';
import styles from '../products.module.css';

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'Europe/Moscow',
});

type Dialog = { action: 'delete' | 'category' | 'status'; products: AdminProduct[] };

interface DeletedProductsNotice {
  token: string;
  message: string;
  error?: string;
}

interface ProductsTableProps {
  products: AdminProduct[];
  categories: { key: string; title: string }[];
}

export default function ProductsTable({ products, categories }: ProductsTableProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [message, setMessage] = useState('');
  const [deletedNotices, setDeletedNotices] = useState<DeletedProductsNotice[]>([]);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const selected = products.filter((product) => selectedIds.includes(product.id));
  const allSelected = selected.length > 0 && selected.length === products.length;
  const partlySelected = selected.length > 0 && !allSelected;

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = partlySelected;
  }, [partlySelected]);

  useEffect(() => {
    if (dialog && !dialogRef.current?.open) dialogRef.current?.showModal();
  }, [dialog]);

  function openDialog(next: Dialog) {
    setError('');
    setMessage('');
    setDialog(next);
  }

  function closeDialog() {
    dialogRef.current?.close();
    setDialog(null);
    setError('');
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dialog || pending) return;

    const data = new FormData(event.currentTarget);
    setError('');
    startTransition(async () => {
      try {
        const result = await changeProducts(
          dialog.products.map(({ id }) => id),
          dialog.action,
          String(data.get('value') ?? ''),
        );
        if (result.error) {
          setError(result.error);
          return;
        }

        setSelectedIds([]);
        if (result.undoToken && result.message) {
          const notice = { token: result.undoToken, message: result.message };
          setDeletedNotices((notices) => [...notices, notice]);
        } else {
          setMessage(result.message ?? '');
        }
        closeDialog();
      } catch {
        setError('Не удалось выполнить действие. Проверь подключение и попробуй ещё раз.');
      }
    });
  }

  function dismissNotice(token: string) {
    setDeletedNotices((notices) => notices.filter((notice) => notice.token !== token));
  }

  function undoDeletion(token: string) {
    if (pending) return;

    startTransition(async () => {
      try {
        const result = await restoreProducts(token);
        if (!result.error) {
          dismissNotice(token);
          setMessage(result.message ?? '');
          return;
        }
        setDeletedNotices((notices) => notices.map((notice) =>
          notice.token === token ? { ...notice, error: result.error } : notice,
        ));
      } catch {
        setDeletedNotices((notices) => notices.map((notice) =>
          notice.token === token ? { ...notice, error: 'Проверь подключение и попробуй ещё раз.' } : notice,
        ));
      }
    });
  }

  return (
    <>
      {message && <p className={styles.actionMessage} role="status">{message}</p>}
      {deletedNotices.length > 0 && (
        <div className={styles.undoNotices} aria-label="Уведомления об удалении">
          {deletedNotices.map(({ token, message, error }) => (
            <div className={styles.undoNotice} key={token}>
              <span className={styles.undoCheck} aria-hidden="true">✓</span>
              <div>
                <p role="status">{message}</p>
                {error && <p className={styles.undoError} role="alert">{error}</p>}
              </div>
              <button type="button" disabled={pending} onClick={() => undoDeletion(token)}>Вернуть</button>
              <button
                className={styles.dismissNotice}
                type="button"
                disabled={pending}
                aria-label={`Закрыть уведомление «${message}»`}
                onClick={() => dismissNotice(token)}>×</button>
            </div>
          ))}
        </div>
      )}
      {selected.length > 0 && (
        <div className={styles.bulkActions} aria-label="Действия с выбранными товарами">
          <strong aria-live="polite">Выбрано: {selected.length}</strong>
          <button type="button" onClick={() => openDialog({ action: 'status', products: selected })}>
            Изменить статус
          </button>
          <button type="button" onClick={() => openDialog({ action: 'category', products: selected })}>
            Сменить категорию
          </button>
          <button className={styles.dangerButton} type="button"
            onClick={() => openDialog({ action: 'delete', products: selected })}>
            Удалить
          </button>
        </div>
      )}

      <div className={styles.tableWrap} role="region" aria-label="Список товаров" tabIndex={0}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  aria-label="Выбрать все товары на странице"
                  checked={allSelected}
                  disabled={!products.length}
                  onChange={(event) => setSelectedIds(event.target.checked ? products.map(({ id }) => id) : [])}
                />
              </th>
              <th scope="col">Товар</th>
              <th scope="col">Категория</th>
              <th scope="col">Цена</th>
              <th scope="col">Остаток</th>
              <th scope="col">Статус</th>
              <th scope="col">Изменён</th>
              <th scope="col">Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <input
                    type="checkbox"
                    aria-label={`Выбрать «${product.name}», ID ${product.id}`}
                    checked={selectedIds.includes(product.id)}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setSelectedIds((ids) => checked
                        ? [...ids, product.id]
                        : ids.filter((id) => id !== product.id));
                    }}
                  />
                </td>
                <th scope="row">
                  <div className={styles.product}>
                    <Image src={product.mainImage} alt="" width={52} height={52} />
                    <div>
                      <strong>{product.name}</strong>
                      <small>ID {product.id} · Фото: {product._count.images + 1}</small>
                    </div>
                  </div>
                </th>
                <td>{product.category.title}</td>
                <td>{formatRubles(product.priceKopecks)}</td>
                <td>{product.stock} шт</td>
                <td>
                  <span className={styles.status} data-status={product.status}>
                    {productStatuses[product.status]}
                  </span>
                  {product.stock === 0 && <small className={styles.outOfStock}>Нет в наличии</small>}
                </td>
                <td>
                  <time dateTime={product.updatedAt.toISOString()}>
                    {dateFormatter.format(product.updatedAt)}
                  </time>
                </td>
                <td>
                  <div className={styles.rowActions}>
                    <Link href={`/admin/products/${product.id}`} title="Изменить" aria-label={`Изменить «${product.name}»`}>
                      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                        <path d="m14 5 5 5M4 20l1-5L16 4a2 2 0 0 1 3 0l1 1a2 2 0 0 1 0 3L9 19l-5 1Z" />
                      </svg>
                    </Link>
                    <button type="button" title="Удалить" aria-label={`Удалить «${product.name}»`}
                      className={styles.deleteIcon}
                      onClick={() => openDialog({ action: 'delete', products: [product] })}>
                      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                        <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7m4-7v7" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!products.length && <tr><td colSpan={8}>Товары по этим условиям не найдены.</td></tr>}
          </tbody>
        </table>
      </div>

      {dialog && (
        <dialog
          ref={dialogRef}
          aria-labelledby="product-dialog-title"
          className={styles.productDialog}
          onCancel={(event) => {
            event.preventDefault();
            if (!pending) closeDialog();
          }}>
          <form onSubmit={submit}>
            <h2 id="product-dialog-title">
              {dialog.action === 'category' && 'Сменить категорию'}
              {dialog.action === 'status' && 'Изменить статус'}
              {dialog.action === 'delete' && (dialog.products.length === 1
                ? `Удалить «${dialog.products[0].name}»?`
                : `Удалить выбранные товары (${dialog.products.length})?`)}
            </h2>

            <fieldset disabled={pending}>
              {dialog.action === 'category' && (
                <label>Новая категория
                  <select name="value" required defaultValue="">
                    <option value="" disabled>Выбрать категорию</option>
                    {categories.map(({ key, title }) => <option key={key} value={key}>{title}</option>)}
                  </select>
                </label>
              )}
              {dialog.action === 'status' && (
                <label>Новый статус
                  <select name="value" required defaultValue="">
                    <option value="" disabled>Выбрать статус</option>
                    <option value="DRAFT">Черновик</option>
                    <option value="HIDDEN">Скрыть с сайта</option>
                    <option value="PUBLISHED">Опубликовать</option>
                  </select>
                </label>
              )}
              {dialog.action === 'delete' && (
                <p>Товары исчезнут из списка и каталога. Сразу после удаления их можно вернуть через уведомление.</p>
              )}
            </fieldset>

            {error && <p className={styles.dialogError} role="alert">{error}</p>}
            <div className={styles.dialogActions}>
              <button className={styles.secondaryButton} type="button" disabled={pending} onClick={closeDialog}>
                Отмена
              </button>
              <button
                className={dialog.action === 'delete' ? styles.dangerButton : styles.searchButton}
                type="submit" disabled={pending}>
                {pending ? 'Подожди…' : dialog.action === 'delete' ? 'Удалить' : 'Сохранить'}
              </button>
            </div>
          </form>
        </dialog>
      )}
    </>
  );
}
