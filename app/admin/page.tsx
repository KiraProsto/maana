import Image from 'next/image';
import Link from 'next/link';
import { verifySession } from '@/app/lib/auth/session';
import { logout } from './actions';
import { getAdminProducts, productPageSize } from './products';
import { isProductStatus, productStatuses } from './product-statuses';
import ProductsTable from './components/ProductsTable';
import styles from './products.module.css';

const roleNames = {
  developer: 'Разработчик',
  admin: 'Администратор',
};

interface AdminPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getParam(value: string | string[] | undefined) {
  return typeof value === 'string' ? value.trim().slice(0, 100) : '';
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const session = await verifySession();
  const params = await searchParams;
  const query = getParam(params.q);
  const category = getParam(params.category);
  const statusParam = getParam(params.status);
  const status = statusParam === 'OUT_OF_STOCK' || isProductStatus(statusParam)
    ? statusParam
    : '';
  const pageParam = getParam(params.page);
  const page = /^\d{1,9}$/.test(pageParam) ? Math.max(1, Number(pageParam)) : 1;
  const result = process.env.DATABASE_URL
    ? await getAdminProducts({ query, category, status, page })
    : null;

  function productsHref(categoryKey: string, pageNumber = 1) {
    const next = new URLSearchParams();
    if (query) next.set('q', query);
    if (categoryKey) next.set('category', categoryKey);
    if (status) next.set('status', status);
    if (pageNumber > 1) next.set('page', String(pageNumber));
    return next.size ? `/admin?${next.toString()}` : '/admin';
  }

  return (
    <div className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <div>
          <Link className={styles.brand} href="/admin">
            <Image src="/logo.svg" alt="МААНА" width={30} height={30} />
            <span>
              <strong>МААНА</strong>
              <small>Админ-панель</small>
            </span>
          </Link>

          <nav className={styles.navigation} aria-label="Разделы админ-панели">
            <Link href="/admin" aria-current="page">Товары</Link>
            <span aria-disabled="true">Мастер-классы</span>
            <span aria-disabled="true">Настройки</span>
          </nav>
        </div>

        <div className={styles.account}>
          <Link href="/">Открыть сайт</Link>
          <div>
            <strong>{session.login}</strong>
            <small>{roleNames[session.role]}</small>
          </div>
          <form action={logout}>
            <button className={styles.secondaryButton} type="submit">Выйти</button>
          </form>
        </div>
      </aside>

      <main className={styles.content} aria-labelledby="admin-title">
        <h1 id="admin-title">Товары</h1>
        {!result ? (
          <p role="status">Укажи DATABASE_URL в .env.local и перезапусти сайт.</p>
        ) : (
          <>
            <form className={styles.filters} action="/admin">
              <input type="hidden" name="category" value={category} />
              <input
                aria-label="Поиск по названию или ID"
                type="search"
                name="q"
                maxLength={100}
                placeholder="Поиск по названию или ID"
                defaultValue={query}
              />
              <select aria-label="Статус товара" name="status" defaultValue={status}>
                <option value="">Все статусы</option>
                {Object.entries(productStatuses).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
                <option value="OUT_OF_STOCK">Нет в наличии</option>
              </select>
              <button className={styles.searchButton} type="submit">Найти</button>
            </form>

            <nav className={styles.categories} aria-label="Категории товаров">
              {[{ key: '', title: 'Все' }, ...result.categories].map(({ key, title }) => (
                <Link
                  key={key}
                  href={productsHref(key)}
                  aria-current={category === key ? 'page' : undefined}
                  className={styles.secondaryButton}>
                  {title}
                </Link>
              ))}
            </nav>

            <ProductsTable
              key={productsHref(category, result.currentPage)}
              products={result.products}
              categories={result.categories}
            />

            <div className={styles.tableFooter}>
              <p>
                {result.total
                  ? `Показано ${(result.currentPage - 1) * productPageSize + 1}–${(result.currentPage - 1) * productPageSize + result.products.length} из ${result.total}`
                  : 'Найдено 0 товаров'}
              </p>
              {result.pageCount > 1 && (
                <nav className={styles.pagination} aria-label="Страницы товаров">
                  {result.currentPage > 1 && (
                    <Link className={styles.secondaryButton} href={productsHref(category, result.currentPage - 1)}>
                      Назад
                    </Link>
                  )}
                  <span>{result.currentPage} / {result.pageCount}</span>
                  {result.currentPage < result.pageCount && (
                    <Link className={styles.secondaryButton} href={productsHref(category, result.currentPage + 1)}>
                      Вперёд
                    </Link>
                  )}
                </nav>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
