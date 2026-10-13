import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Check } from '../../components/icons';
import { adminProductService } from '../../services/adminServices';
import { useToast } from '../../components/Toast';
import Modal from './Modal';
import ImageUploader from './ImageUploader';
import styles from './AdminTable.module.css';
import TableSkeleton from '../../components/TableSkeleton';
import { formatPKR } from '../../utils/currency';

const EMPTY = {
  name: '', brand: 'Luxora', description: '', price: '', comparePrice: '', stock: 0, sku: '',
  movement: '', caseMaterial: '', caseDiameter: '', waterResistance: '', strapMaterial: '', dialColor: '',
  isFeatured: false, isNewArrival: false, isBestSeller: false, isActive: true,
};

export default function AdminProducts() {
  const [products, setProducts] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState([]);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [images, setImages] = useState([]);
  const toast = useToast();

  const load = () => {
    setProducts(null);
    adminProductService.list({ search, page, limit: 15 }).then(({ products, pagination }) => {
      setProducts(products);
      setPagination(pagination);
    }).catch(() => setProducts([]));
  };

  useEffect(() => { load(); }, [search, page]); // eslint-disable-line

  const openCreate = () => { setEditing(null); setForm(EMPTY); setImages([]); setModalOpen(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name, brand: p.brand, description: p.description || '', price: p.price, comparePrice: p.compare_price || '',
      stock: p.stock, sku: p.sku, movement: p.movement || '', caseMaterial: p.case_material || '',
      caseDiameter: p.case_diameter || '', waterResistance: p.water_resistance || '', strapMaterial: p.strap_material || '',
      dialColor: p.dial_color || '', isFeatured: p.is_featured, isNewArrival: p.is_new_arrival, isBestSeller: p.is_best_seller, isActive: p.is_active,
    });
    setImages(p.images || []);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await adminProductService.update(editing.id, form);
        toast.success('Product updated.');
        setModalOpen(false);
        load();
      } else {
        const { product } = await adminProductService.create(form);
        toast.success('Product created — you can now upload images below.');
        setEditing(product); // switch into edit mode so the ImageUploader can attach to the new product
        load();
      }
    } catch (err) {
      toast.error(err.message || 'Could not save product.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminProductService.remove(deleteTarget.id);
      toast.success('Product deleted.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Could not delete product.');
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const toggleSelectAll = () => {
    setSelected((prev) => (prev.length === products?.length ? [] : products.map((p) => p.id)));
  };

  const runBulk = async (action, value) => {
    try {
      await adminProductService.bulk(selected, action, value);
      toast.success(`${selected.length} product${selected.length !== 1 ? 's' : ''} updated.`);
      setSelected([]);
      setBulkDeleteConfirm(false);
      load();
    } catch (err) {
      toast.error(err.message || 'Bulk action failed.');
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <h1>Products</h1>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={15} style={{ marginRight: 6 }} /> Add Product</button>
      </div>

      <div className={styles.toolbar}>
        <input className={styles.searchInput} placeholder="Search products…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        {selected.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{selected.length} selected</span>
            <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.72rem' }} onClick={() => runBulk('activate')}>Activate</button>
            <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.72rem' }} onClick={() => runBulk('deactivate')}>Deactivate</button>
            <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.72rem' }} onClick={() => runBulk('feature')}>Feature</button>
            <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.72rem' }} onClick={() => runBulk('archive')}>Archive</button>
            <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.72rem', borderColor: 'var(--color-error)', color: 'var(--color-error)' }} onClick={() => setBulkDeleteConfirm(true)}>Delete</button>
          </div>
        )}
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: 36 }}>
                <button onClick={toggleSelectAll} className={styles.iconAction} aria-label="Select all">
                  {selected.length === products?.length && products?.length > 0 ? <Check size={12} /> : null}
                </button>
              </th>
              <th>Product</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Flags</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products === null && <TableSkeleton rows={6} columns={9} />}
            {products?.length === 0 && <tr><td colSpan={9} className={styles.empty}>No products found.</td></tr>}
            {products?.map((p) => (
              <tr key={p.id}>
                <td>
                  <button onClick={() => toggleSelect(p.id)} className={styles.iconAction} aria-label="Select row">
                    {selected.includes(p.id) ? <Check size={12} /> : null}
                  </button>
                </td>
                <td>{p.name}</td>
                <td>{p.sku}</td>
                <td>{p.category_name || '—'}</td>
                <td>{formatPKR(Number(p.price))}</td>
                <td>{p.stock}</td>
                <td><span className={`${styles.badge} ${p.is_active ? styles.badgeSuccess : styles.badgeError}`}>{p.is_active ? 'Active' : 'Inactive'}</span></td>
                <td>{[p.is_featured && 'Featured', p.is_new_arrival && 'New', p.is_best_seller && 'Best Seller'].filter(Boolean).join(', ') || '—'}</td>
                <td>
                  <div className={styles.actionsCell}>
                    <button className={styles.iconAction} onClick={() => openEdit(p)} aria-label="Edit"><Pencil size={14} /></button>
                    <button className={`${styles.iconAction} ${styles.iconActionDanger}`} onClick={() => setDeleteTarget(p)} aria-label="Delete"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          {Array.from({ length: pagination.totalPages }).map((_, i) => (
            <button key={i} className={`${styles.pageBtn} ${page === i + 1 ? styles.pageBtnActive : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'Add Product'} width={720}>
        <form className={styles.formGrid} onSubmit={handleSubmit}>
          <label className={styles.field}><span>Name</span><input required placeholder="Enter product name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></label>
          <label className={styles.field}><span>SKU</span><input required placeholder="Enter SKU (e.g. LUX-1001)" value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} /></label>
          <label className={`${styles.field} ${styles.fieldFull}`}><span>Description</span><textarea rows={3} placeholder="Write product description…" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></label>
          <label className={styles.field}><span>Price (PKR)</span><input type="number" required min="0" step="1" placeholder="Enter price in PKR" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} /></label>
          <label className={styles.field}><span>Compare Price (PKR)</span><input type="number" min="0" step="1" placeholder="Optional original price in PKR" value={form.comparePrice} onChange={(e) => setForm((f) => ({ ...f, comparePrice: e.target.value }))} /></label>
          <label className={styles.field}><span>Stock</span><input type="number" required min="0" placeholder="Enter stock quantity" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} /></label>
          <label className={styles.field}><span>Movement</span><input placeholder="e.g. Automatic" value={form.movement} onChange={(e) => setForm((f) => ({ ...f, movement: e.target.value }))} /></label>
          <label className={styles.field}><span>Case Material</span><input placeholder="e.g. 316L Stainless Steel" value={form.caseMaterial} onChange={(e) => setForm((f) => ({ ...f, caseMaterial: e.target.value }))} /></label>
          <label className={styles.field}><span>Case Diameter</span><input placeholder="e.g. 40mm" value={form.caseDiameter} onChange={(e) => setForm((f) => ({ ...f, caseDiameter: e.target.value }))} /></label>
          <label className={styles.field}><span>Water Resistance</span><input placeholder="e.g. 100m" value={form.waterResistance} onChange={(e) => setForm((f) => ({ ...f, waterResistance: e.target.value }))} /></label>
          <label className={styles.field}><span>Strap Material</span><input placeholder="e.g. Italian Leather" value={form.strapMaterial} onChange={(e) => setForm((f) => ({ ...f, strapMaterial: e.target.value }))} /></label>
          <label className={styles.field}><span>Dial Color</span><input placeholder="e.g. Midnight Black" value={form.dialColor} onChange={(e) => setForm((f) => ({ ...f, dialColor: e.target.value }))} /></label>

          <div className={styles.checkboxRow}>
            <label><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))} /> Featured</label>
            <label><input type="checkbox" checked={form.isNewArrival} onChange={(e) => setForm((f) => ({ ...f, isNewArrival: e.target.checked }))} /> New Arrival</label>
            <label><input type="checkbox" checked={form.isBestSeller} onChange={(e) => setForm((f) => ({ ...f, isBestSeller: e.target.checked }))} /> Best Seller</label>
            <label><input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} /> Active</label>
          </div>

          <div className={styles.fieldFull}>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: 8 }}>Product Images</span>
            <ImageUploader productId={editing?.id} images={images} onChange={setImages} />
          </div>

          <div className={styles.formActions}>
            <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>{editing ? 'Done' : 'Cancel'}</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Product'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Product">
        <p style={{ fontSize: '0.9rem', marginBottom: 20 }}>
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
        </p>
        <div className={styles.formActions} style={{ marginTop: 0 }}>
          <button className="btn btn-outline" onClick={() => setDeleteTarget(null)}>Cancel</button>
          <button className="btn btn-primary" style={{ background: 'var(--color-error)' }} onClick={handleDelete}>Delete</button>
        </div>
      </Modal>

      <Modal open={bulkDeleteConfirm} onClose={() => setBulkDeleteConfirm(false)} title="Delete Products">
        <p style={{ fontSize: '0.9rem', marginBottom: 20 }}>
          Delete <strong>{selected.length}</strong> selected product{selected.length !== 1 ? 's' : ''}? This cannot be undone.
        </p>
        <div className={styles.formActions} style={{ marginTop: 0 }}>
          <button className="btn btn-outline" onClick={() => setBulkDeleteConfirm(false)}>Cancel</button>
          <button className="btn btn-primary" style={{ background: 'var(--color-error)' }} onClick={() => runBulk('delete')}>Delete All</button>
        </div>
      </Modal>
    </div>
  );
}
