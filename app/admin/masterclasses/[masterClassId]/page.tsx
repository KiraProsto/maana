import { notFound } from 'next/navigation';
import { verifySession } from '@/app/lib/auth/session';
import AdminSidebar from '../../components/AdminSidebar';
import MasterClassEditor from '../../components/MasterClassEditor';
import styles from '../../products.module.css';
import { getEditableMasterClass } from '../data';

export default async function MasterClassEditorPage({
  params,
}: {
  params: Promise<{ masterClassId: string }>;
}) {
  const session = await verifySession();
  const { masterClassId } = await params;
  const isNew = masterClassId === 'new';
  const id = Number(masterClassId);
  if (!isNew && (!/^[1-9]\d{0,9}$/.test(masterClassId) || id > 2_147_483_647)) notFound();

  const masterClass = !isNew && process.env.DATABASE_URL ? await getEditableMasterClass(id) : null;
  if (process.env.DATABASE_URL && !isNew && !masterClass) notFound();

  return (
    <div className={styles.dashboard}>
      <AdminSidebar session={session} section="masterclasses" />
      <main className={styles.content}>
        {process.env.DATABASE_URL
          ? <MasterClassEditor masterClass={masterClass} />
          : <p role="status">Укажи DATABASE_URL в .env.local и перезапусти сайт.</p>}
      </main>
    </div>
  );
}
