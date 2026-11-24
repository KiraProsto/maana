import { notFound } from 'next/navigation';
import { verifySession } from '@/app/lib/auth/session';
import AdminSidebar from '../../components/AdminSidebar';
import ProductEditor from '../../components/ProductEditor';
import { getEditableProduct, getProductCategories } from '../../products';
import styles from '../../products.module.css';

export default async function ProductEditorPage({ params }: { params: Promise<{ productId: string }> }) {
  const session = await verifySession();
  const { productId } = await params;
  const isNew = productId === 'new';
  const id = Number(productId);
  if (!isNew && (!/^[1-9]\d{0,9}$/.test(productId) || id > 2_147_483_647)) notFound();

  if (!process.env.DATABASE_URL) {
    return <main><p>Укажи DATABASE_URL в .env.local и перезапусти сайт.</p></main>;
  }

  const [product, categories] = await Promise.all([
    isNew ? null : getEditableProduct(id),
    getProductCategories(),
  ]);
  if (!isNew && !product) notFound();

  return (
    <div className={styles.dashboard}>
      <AdminSidebar session={session} />
      <main className={styles.content} aria-labelledby="editor-title">
        <ProductEditor product={product} categories={categories} />
      </main>
    </div>
  );
}
