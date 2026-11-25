'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import type { FormEvent } from 'react';
import { formatRubles, priceToKopecks } from '@/app/lib/catalog/price';
import DeleteMasterClassDialog from '../masterclasses/DeleteMasterClassDialog';
import { saveMasterClass } from '../masterclasses/actions';
import { maxPhotoBytes, maxUploadBytes } from '../product-photo-limits';
import { maxMasterClassMedia, maxVideoBytes } from '../masterclasses/media-limits';
import { productStatuses } from '../product-statuses';
import type { EditableMasterClass } from '../masterclasses/data';
import styles from '../products.module.css';
import editor from './ProductEditor.module.css';

type GalleryMedia = { src: string; kind: 'IMAGE' | 'VIDEO'; position?: number; file?: File };

interface MasterClassEditorProps {
  masterClass: EditableMasterClass | null;
}

const fileTypes = 'image/jpeg,image/png,image/webp';
const ages = ['0+', '6+', '14+', '18+'];

function Photo({ src, alt }: { src?: string; alt: string }) {
  return (
    <div className={editor.photo}>
      {src ? <Image src={src} alt={alt} fill unoptimized sizes="320px" /> : <span>Главное фото</span>}
    </div>
  );
}

function previewPrice(price: string) {
  try {
    return formatRubles(priceToKopecks(price, 'мастер-класса'));
  } catch {
    return 'Цена появится здесь';
  }
}

export default function MasterClassEditor({ masterClass }: MasterClassEditorProps) {
  const router = useRouter();
  const [name, setName] = useState(masterClass?.title ?? '');
  const [price, setPrice] = useState(masterClass?.priceKopecks != null ? String(masterClass.priceKopecks / 100) : '');
  const [age, setAge] = useState(masterClass?.age ?? '');
  const [duration, setDuration] = useState(masterClass?.duration ?? '');
  const dragged = useRef<number | null>(null);
  const [cover, setCover] = useState<{ src: string; file: File } | null>(null);
  const [gallery, setGallery] = useState<GalleryMedia[]>(masterClass?.media ?? []);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const urls = useRef(new Set<string>());

  useEffect(() => {
    const previews = urls.current;
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
      previews.clear();
    };
  }, []);

  function addPreview(file: File) {
    const src = URL.createObjectURL(file);
    urls.current.add(src);
    return { src, file };
  }

  function removePreview(src: string) {
    if (urls.current.delete(src)) URL.revokeObjectURL(src);
  }

  function pickCover(file: File | undefined) {
    if (!file) return;
    if (!file.size || file.size > maxPhotoBytes) {
      setError('Выбери главное фото размером до 5 МБ.');
      return;
    }
    if (cover) removePreview(cover.src);
    setCover(addPreview(file));
    setError('');
  }

  function addGallery(files: File[]) {
    if (!files.length) return;
    const media = files.map((file) => ({
      file,
      kind: file.type === 'video/mp4' || /\.mp4$/i.test(file.name) ? 'VIDEO' as const : 'IMAGE' as const,
    }));
    if (media.some(({ file, kind }) => !file.size || file.size > (kind === 'VIDEO' ? maxVideoBytes : maxPhotoBytes))) {
      setError('Фото до 5 МБ, видео до 20 МБ.');
      return;
    }
    if (gallery.length + media.length > maxMasterClassMedia) {
      setError('В галерее может быть до 8 файлов.');
      return;
    }
    setGallery([...gallery, ...media.map(({ file, kind }) => ({ ...addPreview(file), kind }))]);
    setError('');
  }

  function moveMedia(from: number, to: number) {
    if (from === to || to < 0 || to >= gallery.length) return;
    const reordered = [...gallery];
    const [item] = reordered.splice(from, 1);
    reordered.splice(to, 0, item);
    setGallery(reordered);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    if (!cover && !masterClass?.mainImage) {
      setError('Добавь главное фото.');
      return;
    }

    const data = new FormData(event.currentTarget);
    let bytes = cover?.file.size ?? 0;
    if (cover) data.set('cover', cover.file);
    for (const [index, item] of gallery.entries()) {
      if (item.file) {
        data.append('mediaOrder', `new:${index}`);
        data.set(`media-${index}`, item.file);
        bytes += item.file.size;
      } else {
        data.append('mediaOrder', `old:${item.position}`);
      }
    }
    if (bytes > maxUploadBytes) {
      setError('За одно сохранение можно загрузить до 20 МБ. Убери часть новых фото.');
      return;
    }

    setError('');
    startTransition(async () => {
      try {
        const result = await saveMasterClass(masterClass?.id ?? null, masterClass?.updatedAt.toISOString() ?? '', data);
        if (result.error) {
          setError(result.error);
          return;
        }
        router.replace('/admin/masterclasses');
      } catch {
        setError('Не удалось сохранить товар. Проверь подключение и попробуй ещё раз.');
      }
    });
  }

  function finishDeletion(notice: { token: string; title: string }) {
    setConfirmDelete(false);
    try {
      sessionStorage.setItem('maana-masterclass-deletion', JSON.stringify(notice));
    } catch {
      // Browser storage may be disabled.
    }
    router.replace('/admin/masterclasses');
  }

  const mainImage = cover?.src ?? masterClass?.mainImage;

  return (
    <form onSubmit={submit} aria-busy={pending}>
      <p className={editor.breadcrumb}><Link href="/admin/masterclasses">Мастер-классы</Link> / {masterClass?.title ?? 'Новый формат'}</p>
      <div className={editor.heading}>
        <h1 id="editor-title">{masterClass ? 'Мастер-класс' : 'Новый мастер-класс'}</h1>
        <div className={editor.actions}>
          <Link className={styles.secondaryButton} href="/admin/masterclasses">Отмена</Link>
          <button className={styles.searchButton} type="submit" disabled={pending}>
            {pending ? 'Сохраняем…' : masterClass ? 'Сохранить' : 'Добавить мастер-класс'}
          </button>
        </div>
      </div>

      {error && <p className={editor.error} role="alert">{error}</p>}

      <div className={editor.layout}>
        <fieldset className={editor.fields} disabled={pending}>
          <section className={editor.card} aria-labelledby="product-main">
            <h2 id="product-main">Основное</h2>
            <label>Название
              <input name="title" value={name} onChange={(event) => setName(event.target.value)} maxLength={250} required />
            </label>
            <div className={editor.threeColumns}>
              <label>Возраст
                <input name="age" value={age} onChange={(event) => setAge(event.target.value)} maxLength={30} required />
              </label>
              <label>Длительность
                <input name="duration" value={duration} onChange={(event) => setDuration(event.target.value)} maxLength={80} required />
              </label>
              <label>Цена, ₽
                <input name="price" value={price} onChange={(event) => setPrice(event.target.value)} inputMode="decimal" />
              </label>
            </div>
            <div className={editor.ageOptions} aria-label="Быстрый выбор возраста">
              {ages.map((option) => (
                <button key={option} type="button" className={styles.secondaryButton}
                  aria-pressed={age === option} onClick={() => setAge(option)}>{option}</button>
              ))}
            </div>
            <label>Статус
              <select name="status" defaultValue={masterClass?.status ?? 'DRAFT'}>
                {Object.entries(productStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label>Описание
              <textarea name="description" rows={12} maxLength={20000} defaultValue={masterClass?.description} />
            </label>
            <small>Пустая строка начинает новый абзац. Строки с «·» отображаются списком.</small>
          </section>

          <section className={editor.card} aria-labelledby="product-photos">
            <h2 id="product-photos">Фотографии и видео</h2>
            <div
              className={editor.photos}
              onDragOver={(event) => {
                if (event.dataTransfer.types.includes('Files')) event.preventDefault();
              }}
              onDrop={(event) => {
                if (!event.dataTransfer.types.includes('Files')) return;
                event.preventDefault();
                addGallery(Array.from(event.dataTransfer.files));
              }}>
              <div className={editor.cover}>
                <h3>Главное фото</h3>
                <Photo src={mainImage} alt="Главное фото мастер-класса" />
                <label className={editor.pick}>
                  {mainImage ? 'Заменить фото' : 'Загрузить фото'}
                  <input type="file" aria-label="Главное фото" accept={fileTypes} onChange={(event) => {
                    pickCover(event.target.files?.[0]);
                    event.target.value = '';
                  }} />
                </label>
              </div>
              <div>
                <h3>Галерея · {gallery.length} из {maxMasterClassMedia}</h3>
                <div className={editor.gallery}>
                  {gallery.map((photo, index) => (
                    <div
                      className={editor.galleryTile}
                      key={photo.position ?? photo.src}
                      draggable
                      onDragStart={(event) => {
                        dragged.current = index;
                        event.dataTransfer.setData('text/plain', String(index));
                        event.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragEnd={() => { dragged.current = null; }}
                      onDragOver={(event) => { if (dragged.current !== null) event.preventDefault(); }}
                      onDrop={(event) => {
                        if (dragged.current === null) return;
                        event.preventDefault();
                        moveMedia(dragged.current, index);
                        dragged.current = null;
                      }}>
                      <div className={editor.thumbnail}>
                        {photo.kind === 'VIDEO'
                          ? <video className={editor.video} src={photo.src} muted preload="metadata" aria-label={`Видео ${index + 1}`} />
                          : <Photo src={photo.src} alt={`Фото галереи ${index + 1}`} />}
                        <span className={editor.mediaNumber}>{index + 1}</span>
                        <button type="button" aria-label={`Убрать файл ${index + 1}`} onClick={() => {
                          removePreview(photo.src);
                          setGallery(gallery.filter((entry) => entry !== photo));
                          setError('');
                        }}>×</button>
                      </div>
                      <div className={editor.moveButtons}>
                        <button type="button" aria-label={`Переместить файл ${index + 1} влево`} disabled={index === 0} onClick={() => moveMedia(index, index - 1)}>←</button>
                        <button type="button" aria-label={`Переместить файл ${index + 1} вправо`} disabled={index === gallery.length - 1} onClick={() => moveMedia(index, index + 1)}>→</button>
                      </div>
                    </div>
                  ))}
                  {gallery.length < maxMasterClassMedia && <label className={editor.pick}>
                    + Добавить файлы
                    <input type="file" aria-label="Файлы галереи" accept={`${fileTypes},video/mp4,.mp4`} multiple onChange={(event) => {
                      addGallery(Array.from(event.target.files ?? []));
                      event.target.value = '';
                    }} />
                  </label>}
                </div>
              </div>
            </div>
            <small>JPG, PNG и WebP до 5 МБ. В галерею можно добавить MP4. До 20 МБ за сохранение.</small>
            <small>Перетащи файлы в галерею. Порядок можно изменить перетаскиванием или стрелками.</small>
          </section>

        </fieldset>

        <aside className={editor.preview} aria-label="Предпросмотр и удаление">
          <section className={editor.card}>
            <h2>Как в каталоге</h2>
            <div className={editor.previewMedia}>
              <Photo src={mainImage} alt="Предпросмотр обложки" />
              {age && <span className={editor.ageBadge}>{age}</span>}
            </div>
            <strong>{name.trim() || 'Название мастер-класса'}</strong>
            <div className={editor.previewDetails}>
              <span>{duration || 'Длительность'}</span>
              {price.trim() && <span>{previewPrice(price)}</span>}
            </div>
          </section>
          {masterClass && (
            <section className={editor.deleteCard}>
              <button className={styles.dangerButton} type="button" disabled={pending} onClick={() => setConfirmDelete(true)}>
                Удалить мастер-класс
              </button>
            </section>
          )}
        </aside>
      </div>
      {confirmDelete && masterClass && (
        <DeleteMasterClassDialog
          item={masterClass}
          onCancel={() => setConfirmDelete(false)}
          onDeleted={finishDeletion}
        />
      )}
    </form>
  );
}
