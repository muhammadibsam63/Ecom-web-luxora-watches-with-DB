import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from '../../components/icons';
import { adminCollectionService } from '../../services/adminServices';
import { useToast } from '../../components/Toast';
import Modal from './Modal';
import styles from './AdminTable.module.css';
import TableSkeleton from '../../components/TableSkeleton';

const EMPTY = { name: '', description: '', heroImage: '', bannerImage: '', displayOrder: 0, isActive: true };

export default function AdminCollections() {
  const [collections, setCollections] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useToast();

  const load = () => adminCollectionService.list().then(({ collections }) => setCollections(collections)).catch(() => setCollections([]));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description || '', heroImage: c.hero_image || '', bannerImage: c.banner_image || '', displayOrder: c.display_order, isActive: c.is_active });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await adminCollectionService.update(editing.id, form);
      else await adminCollectionService.create(form);
      toast.success(editing ? 'Collection updated.' : 'Collection created.');
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.message || 'Could not save collection.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminCollectionService.remove(deleteTarget.id);
      toast.success('Collection deleted.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Could not delete collection.');
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <h1>Collections</h1>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={15} style={{ marginRight: 6 }} /> Create Collection</button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Name</th><th>Slug</th><th>Products</th><th>Order</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {collections === null && <TableSkeleton rows={6} columns={6} />}
            {collections?.length === 0 && <tr><td colSpan={6} className={styles.empty}>No collections yet.</td></tr>}
            {collections?.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.slug}</td>
                <td>{c.product_count}</td>
                <td>{c.display_order}</td>
                <td><span className={`${styles.badge} ${c.is_active ? styles.badgeSuccess : styles.badgeError}`}>{c.is_active ? 'Active' : 'Inactive'}</span></td>
                <td>
                  <div className={styles.actionsCell}>
                    <button className={styles.iconAction} onClick={() => openEdit(c)} aria-label="Edit"><Pencil size={14} /></button>
                    <button className={`${styles.iconAction} ${styles.iconActionDanger}`} onClick={() => setDeleteTarget(c)} aria-label="Delete"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Collection' : 'Create Collection'}>
        <form className={styles.formGrid} onSubmit={handleSubmit}>
          <label className={`${styles.field} ${styles.fieldFull}`}><span>Name</span><input placeholder="Enter name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></label>
          <label className={`${styles.field} ${styles.fieldFull}`}><span>Description</span><textarea placeholder="Write a description…" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></label>
          <label className={styles.field}><span>Hero Image URL</span><input placeholder="Paste hero image URL" value={form.heroImage} onChange={(e) => setForm((f) => ({ ...f, heroImage: e.target.value }))} /></label>
          <label className={styles.field}><span>Banner Image URL</span><input placeholder="Paste banner image URL" value={form.bannerImage} onChange={(e) => setForm((f) => ({ ...f, bannerImage: e.target.value }))} /></label>
          <label className={styles.field}><span>Display Order</span><input placeholder="Enter display order (e.g. 1)" type="number" value={form.displayOrder} onChange={(e) => setForm((f) => ({ ...f, displayOrder: e.target.value }))} /></label>
          <label className={styles.checkboxRow} style={{ alignSelf: 'end' }}>
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} /> Active
          </label>
          <div className={styles.formActions}>
            <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Collection'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Collection">
        <p style={{ fontSize: '0.9rem', marginBottom: 20 }}>Delete <strong>{deleteTarget?.name}</strong>? Products in this collection will be unassigned.</p>
        <div className={styles.formActions} style={{ marginTop: 0 }}>
          <button className="btn btn-outline" onClick={() => setDeleteTarget(null)}>Cancel</button>
          <button className="btn btn-primary" style={{ background: 'var(--color-error)' }} onClick={handleDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}
