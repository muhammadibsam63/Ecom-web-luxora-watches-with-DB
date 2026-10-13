import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from '../../components/icons';
import { adminCategoryService } from '../../services/adminServices';
import { useToast } from '../../components/Toast';
import Modal from './Modal';
import styles from './AdminTable.module.css';
import TableSkeleton from '../../components/TableSkeleton';

const EMPTY = { name: '', description: '', imageUrl: '', displayOrder: 0, isActive: true };

export default function AdminCategories() {
  const [categories, setCategories] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useToast();

  const load = () => adminCategoryService.list().then(({ categories }) => setCategories(categories)).catch(() => setCategories([]));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description || '', imageUrl: c.image_url || '', displayOrder: c.display_order, isActive: c.is_active });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await adminCategoryService.update(editing.id, form);
      else await adminCategoryService.create(form);
      toast.success(editing ? 'Category updated.' : 'Category created.');
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.message || 'Could not save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminCategoryService.remove(deleteTarget.id);
      toast.success('Category deleted.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Could not delete category.');
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <h1>Categories</h1>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={15} style={{ marginRight: 6 }} /> Add Category</button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Name</th><th>Slug</th><th>Products</th><th>Order</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {categories === null && <TableSkeleton rows={6} columns={6} />}
            {categories?.length === 0 && <tr><td colSpan={6} className={styles.empty}>No categories yet.</td></tr>}
            {categories?.map((c) => (
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'Add Category'}>
        <form className={styles.formGrid} onSubmit={handleSubmit}>
          <label className={`${styles.field} ${styles.fieldFull}`}><span>Name</span><input placeholder="Enter name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></label>
          <label className={`${styles.field} ${styles.fieldFull}`}><span>Description</span><textarea placeholder="Write a description…" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></label>
          <label className={`${styles.field} ${styles.fieldFull}`}><span>Image URL</span><input placeholder="Paste image URL" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} /></label>
          <label className={styles.field}><span>Display Order</span><input placeholder="Enter display order (e.g. 1)" type="number" value={form.displayOrder} onChange={(e) => setForm((f) => ({ ...f, displayOrder: e.target.value }))} /></label>
          <label className={styles.checkboxRow} style={{ alignSelf: 'end' }}>
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} /> Active
          </label>
          <div className={styles.formActions}>
            <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Category'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Category">
        <p style={{ fontSize: '0.9rem', marginBottom: 20 }}>Delete <strong>{deleteTarget?.name}</strong>? Products in this category will become uncategorized.</p>
        <div className={styles.formActions} style={{ marginTop: 0 }}>
          <button className="btn btn-outline" onClick={() => setDeleteTarget(null)}>Cancel</button>
          <button className="btn btn-primary" style={{ background: 'var(--color-error)' }} onClick={handleDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}
