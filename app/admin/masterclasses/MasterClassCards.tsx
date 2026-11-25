'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { formatRubles } from '@/app/lib/catalog/price';
import { productStatuses } from '../product-statuses';
import styles from '../products.module.css';
import { changeMasterClass, restoreMasterClass } from './actions';
import type { AdminMasterClass } from './data';
import DeleteMasterClassDialog from './DeleteMasterClassDialog';
import cards from './masterclasses.module.css';

interface DeletionNotice {
  token: string;
  title: string;
}

export default function MasterClassCards({ items }: { items: AdminMasterClass[] }) {
  const [deleting, setDeleting] = useState<AdminMasterClass | null>(null);
  const [notices, setNotices] = useState<DeletionNotice[]>([]);
  const [feedback, setFeedback] = useState('');
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('maana-masterclass-deletion');
      if (!saved) return;
      sessionStorage.removeItem('maana-masterclass-deletion');
      const notice: DeletionNotice = JSON.parse(saved);
      if (typeof notice.token === 'string' && typeof notice.title === 'string') {
        queueMicrotask(() => setNotices((existing) => [...existing, notice]));
      }
    } catch {
      // The list remains usable if browser storage is unavailable.
    }
  }, []);

  function change(item: AdminMasterClass, action: 'hide' | 'publish') {
    if (pending) return;
    setFeedback('');

    startTransition(async () => {
      try {
        const result = await changeMasterClass(item.id, item.updatedAt.toISOString(), action);
        if (result.error) {
          setFeedback(result.error);
        }
      } catch {
        setFeedback('Не удалось выполнить действие. Попробуй ещё раз.');
      }
    });
  }

  function dismiss(token: string) {
    setNotices((existing) => existing.filter((notice) => notice.token !== token));
  }

  function undo(token: string) {
    if (pending) return;
    setFeedback('');

    startTransition(async () => {
      try {
        const result = await restoreMasterClass(token);
        if (result.error) {
          setFeedback(result.error);
          return;
        }
        dismiss(token);
        setFeedback('Мастер-класс восстановлен.');
      } catch {
        setFeedback('Не удалось вернуть мастер-класс. Попробуй ещё раз.');
      }
    });
  }

  return (
    <>
      {feedback && <p className={styles.actionMessage} role="status">{feedback}</p>}
      <div className={cards.grid}>
        {items.map((item) => (
          <article className={cards.card} key={item.id}>
            <div className={cards.cover}>
              <Image src={item.mainImage} alt="" fill sizes="(max-width: 640px) 100vw, 320px" />
              <span className={cards.age}>{item.age}</span>
              <span className={styles.status} data-status={item.status}>{productStatuses[item.status]}</span>
            </div>
            <div className={cards.body}>
              <h3>{item.title}</h3>
              <p className={cards.details}>
                <span>{item.duration}</span>
                {item.priceKopecks !== null && <span>{formatRubles(item.priceKopecks)}</span>}
              </p>
              <div className={cards.actions}>
                <Link className={styles.secondaryButton} href={`/admin/masterclasses/${item.id}`}>Редактировать</Link>
                <button className={styles.secondaryButton} type="button" disabled={pending} onClick={() =>
                  change(item, item.status === 'PUBLISHED' ? 'hide' : 'publish')}>
                  {item.status === 'PUBLISHED' ? 'Скрыть' : 'Опубликовать'}
                </button>
                <button className={cards.deleteButton} type="button" title="Удалить"
                  aria-label={`Удалить «${item.title}»`} disabled={pending} onClick={() => setDeleting(item)}>
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7m4-7v7" />
                  </svg>
                </button>
              </div>
            </div>
          </article>
        ))}
        <Link className={cards.newCard} href="/admin/masterclasses/new">
          <span aria-hidden="true">+</span>
          Новый формат
        </Link>
      </div>
      {deleting && (
        <DeleteMasterClassDialog
          item={deleting}
          onCancel={() => setDeleting(null)}
          onDeleted={(notice) => {
            setDeleting(null);
            setFeedback('');
            setNotices((existing) => [...existing, notice]);
          }}
        />
      )}
      {notices.length > 0 && (
        <div className={styles.undoNotices} aria-label="Уведомления об удалении">
          {notices.map(({ token, title }) => (
            <div className={styles.undoNotice} key={token}>
              <span className={styles.undoCheck} aria-hidden="true">✓</span>
              <p role="status">«{title}» удалён</p>
              <button type="button" disabled={pending} onClick={() => undo(token)}>Вернуть</button>
              <button className={styles.dismissNotice} type="button" disabled={pending}
                aria-label="Закрыть уведомление" onClick={() => dismiss(token)}>×</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
