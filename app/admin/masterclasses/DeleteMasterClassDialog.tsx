'use client';

import { useEffect, useId, useRef, useState, useTransition } from 'react';
import { changeMasterClass } from './actions';
import styles from '../products.module.css';

interface DeleteMasterClassDialogProps {
  item: { id: number; title: string; updatedAt: Date };
  onCancel: () => void;
  onDeleted: (notice: { token: string; title: string }) => void;
}

export default function DeleteMasterClassDialog({ item, onCancel, onDeleted }: DeleteMasterClassDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog?.open) dialog?.showModal();
    return () => dialog?.close();
  }, []);

  function cancel() {
    if (pending) return;
    dialogRef.current?.close();
    onCancel();
  }

  function confirm() {
    if (pending) return;
    setError('');

    startTransition(async () => {
      try {
        const result = await changeMasterClass(item.id, item.updatedAt.toISOString(), 'delete');
        if (!result.deletionToken) {
          setError(result.error ?? 'Не удалось удалить мастер-класс.');
          return;
        }

        dialogRef.current?.close();
        onDeleted({ token: result.deletionToken, title: item.title });
      } catch {
        setError('Не удалось удалить мастер-класс. Попробуй ещё раз.');
      }
    });
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.productDialog}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        cancel();
      }}>
      <h2 id={titleId}>Удалить «{item.title}»?</h2>
      <p id={descriptionId}>Мастер-класс исчезнет из списка и с сайта. Его можно вернуть через уведомление внизу.</p>
      {error && <p className={styles.dialogError} role="alert">{error}</p>}
      <div className={styles.dialogActions}>
        <button className={styles.secondaryButton} type="button" disabled={pending} onClick={cancel}>
          Отмена
        </button>
        <button className={styles.dangerButton} type="button" disabled={pending} onClick={confirm}>
          {pending ? 'Удаляем…' : 'Удалить'}
        </button>
      </div>
    </dialog>
  );
}
