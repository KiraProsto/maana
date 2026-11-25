'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import type { FormEvent } from 'react';
import { formatRubles, priceToKopecks } from '@/app/lib/catalog/price';
import { saveProduct } from '../product-actions';
import { maxGalleryPhotos, maxPhotoBytes, maxUploadBytes } from '../product-photo-limits';
import { productStatuses } from '../product-statuses';
import type { EditableProduct } from '../products';
import styles from '../products.module.css';
import editor from './ProductEditor.module.css';

type GalleryPhoto = { src: string; position: number; file?: undefined } |
  { src: string; file: File; position?: undefined };

interface ProductEditorProps {
  product: EditableProduct | null;
  categories: { key: string; title: string }[];
}

const fileTypes = 'image/jpeg,image/png,image/webp';

function Photo({ src, alt }: { src?: string; alt: string }) {
  return (
    <div className={editor.photo}>
      {src ? <Image src={src} alt={alt} fill unoptimized sizes="320px" /> : <span>Главное фото</span>}
    </div>
  );
}

function previewPrice(price: string) {
  try {
    return formatRubles(priceToKopecks(price, 'товара'));
  } catch {
    return 'Цена появится здесь';
  }
}

export default function ProductEditor({ product, categories }: ProductEditorProps) {
  const router = useRouter();
  const [name, setName] = useState(product?.name ?? '');
  const [price, setPrice] = useState(product ? String(product.priceKopecks / 100) : '');
  const [cover, setCover] = useState<{ src: string; file: File } | null>(null);
  const [gallery, setGallery] = useState<GalleryPhoto[]>(product?.images ?? []);
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
    if (files.some((file) => !file.size || file.size > maxPhotoBytes)) {
      setError('Каждое фото в галерее должно быть размером до 5 МБ.');
      return;
    }
    if (gallery.length + files.length > maxGalleryPhotos) {
      setError('В галерее может быть до 20 фото.');
      return;
    }
    setGallery([...gallery, ...files.map(addPreview)]);
    setError('');
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    if (!cover && !product?.mainImage) {
      setError('Добавь главное фото.');
      return;
    }

    const data = new FormData(event.currentTarget);
    let bytes = cover?.file.size ?? 0;
    if (cover) data.set('cover', cover.file);
    for (const photo of gallery) {
      if (photo.file) {
        data.append('galleryFiles', photo.file);
        bytes += photo.file.size;
      } else {
        data.append('galleryPosition', String(photo.position));
      }
    }
    if (bytes > maxUploadBytes) {
      setError('За одно сохранение можно загрузить до 20 МБ. Убери часть новых фото.');
      return;
    }

    setError('');
    startTransition(async () => {
      try {
        const result = await saveProduct(product?.id ?? null, product?.updatedAt.toISOString() ?? '', data);
        if (result.error) {
          setError(result.error);
          return;
        }
        router.replace('/admin');
      } catch {
        setError('Не удалось сохранить товар. Проверь подключение и попробуй ещё раз.');
      }
    });
  }

  const mainImage = cover?.src ?? product?.mainImage;

  return (
    <form onSubmit={submit} aria-busy={pending}>
      <p className={editor.breadcrumb}><Link href="/admin">Товары</Link> / {product ? `ID ${product.id}` : 'Новый товар'}</p>
      <div className={editor.heading}>
        <h1 id="editor-title">{product ? 'Редактирование' : 'Новый товар'}</h1>
        <div className={editor.actions}>
          <Link className={styles.secondaryButton} href="/admin">Отмена</Link>
          <button className={styles.searchButton} type="submit" disabled={pending || !categories.length}>
            {pending ? 'Сохраняем…' : product ? 'Сохранить' : 'Добавить товар'}
          </button>
        </div>
      </div>

      {error && <p className={editor.error} role="alert">{error}</p>}

      <div className={editor.layout}>
        <fieldset className={editor.fields} disabled={pending}>
          <section className={editor.card} aria-labelledby="product-main">
            <h2 id="product-main">Основное</h2>
            <label>Название
              <input name="name" value={name} onChange={(event) => setName(event.target.value)} maxLength={250} required />
            </label>
            <div className={editor.twoColumns}>
              <label>Цена, ₽
                <input name="price" value={price} onChange={(event) => setPrice(event.target.value)} inputMode="decimal" required />
              </label>
              <label>Остаток, шт
                <input name="stock" type="number" min={0} max={2147483647} defaultValue={product?.stock ?? 0} required />
              </label>
              <label>Категория
                <select name="category" defaultValue={product?.categoryKey ?? ''} required>
                  <option value="" disabled>Выбрать категорию</option>
                  {categories.map(({ key, title }) => <option key={key} value={key}>{title}</option>)}
                </select>
              </label>
              <label>Статус
                <select name="status" defaultValue={product?.status ?? 'DRAFT'}>
                  {Object.entries(productStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
            </div>
          </section>

          <section className={editor.card} aria-labelledby="product-photos">
            <h2 id="product-photos">Фотографии</h2>
            <div className={editor.photos}>
              <div className={editor.cover}>
                <h3>Главное фото</h3>
                <Photo src={mainImage} alt="Главное фото товара" />
                <label className={editor.pick}>
                  {mainImage ? 'Заменить фото' : 'Загрузить фото'}
                  <input type="file" aria-label="Главное фото" accept={fileTypes} onChange={(event) => {
                    pickCover(event.target.files?.[0]);
                    event.target.value = '';
                  }} />
                </label>
              </div>
              <div>
                <h3>Галерея · {gallery.length}</h3>
                <div className={editor.gallery}>
                  {gallery.map((photo, index) => (
                    <div className={editor.thumbnail} key={photo.position ?? photo.src}>
                      <Photo src={photo.src} alt={`Фото галереи ${index + 1}`} />
                      <button type="button" aria-label={`Убрать фото ${index + 1}`} onClick={() => {
                        removePreview(photo.src);
                        setGallery(gallery.filter((entry) => entry !== photo));
                        setError('');
                      }}>×</button>
                    </div>
                  ))}
                  <label className={editor.pick}>
                    + Добавить фото
                    <input type="file" aria-label="Фото галереи" accept={fileTypes} multiple onChange={(event) => {
                      addGallery(Array.from(event.target.files ?? []));
                      event.target.value = '';
                    }} />
                  </label>
                </div>
              </div>
            </div>
            <small>JPG, PNG и WebP. До 5 МБ на фото и 20 МБ за сохранение.</small>
          </section>

          <section className={editor.card} aria-labelledby="product-texts">
            <h2 id="product-texts">Тексты</h2>
            <label>Описание
              <textarea name="description" rows={5} maxLength={20000} defaultValue={product?.description} />
            </label>
            <label>Преимущества
              <textarea name="advantages" rows={3} maxLength={20000} defaultValue={product?.advantages} />
            </label>
            <label>Характеристики
              <textarea name="characteristics" rows={4} maxLength={20000} defaultValue={product?.characteristics} />
            </label>
          </section>
        </fieldset>

        <aside className={`${editor.card} ${editor.preview}`} aria-labelledby="product-preview">
          <h2 id="product-preview">Как в каталоге</h2>
          <Photo src={mainImage} alt="Предпросмотр обложки" />
          <strong>{name.trim() || 'Название товара'}</strong>
          <p>{previewPrice(price)}</p>
        </aside>
      </div>
    </form>
  );
}
