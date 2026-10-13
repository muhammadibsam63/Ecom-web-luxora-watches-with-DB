import { useEffect, useState } from 'react';
import { AlertTriangle } from '../../components/icons';
import { adminAnalyticsService } from '../../services/adminServices';
import { adminProductService } from '../../services/adminServices';
import { useToast } from '../../components/Toast';
import styles from './AdminTable.module.css';
import TableSkeleton from '../../components/TableSkeleton';

const STATUS_LABEL = { in_stock: 'In Stock', low_stock: 'Low Stock', out_of_stock: 'Out of Stock' };

export default function AdminInventory() {
  const [inventory, setInventory] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const toast = useToast();

  const load = () => {
    adminAnalyticsService.inventory().then(({ inventory }) => setInventory(inventory)).catch(() => setInventory([]));
  };

  useEffect(() => { load(); }, []);

  const lowStockCount = inventory?.filter((i) => i.status === 'low_stock').length || 0;
  const outOfStockCount = inventory?.filter((i) => i.status === 'out_of_stock').length || 0;

  const startEdit = (item) => { setEditingId(item.id); setEditValue(String(item.stock)); };

  const saveStock = async (id) => {
    try {
      await adminProductService.updateStock(id, Number(editValue));
      toast.success('Stock updated.');
      setEditingId(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Could not update stock.');
    }
  };

  return (
    <div>
      <div className={styles.header}><h1>Inventory</h1></div>

      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          {lowStockCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(198,166,100,0.1)', border: '1px solid var(--color-gold)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--color-gold)' }}>
              <AlertTriangle size={16} /> {lowStockCount} products low on stock
            </div>
          )}
          {outOfStockCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(201,119,107,0.1)', border: '1px solid var(--color-error)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--color-error)' }}>
              <AlertTriangle size={16} /> {outOfStockCount} products out of stock
            </div>
          )}
        </div>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Product</th><th>SKU</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {inventory === null && <TableSkeleton rows={6} columns={5} />}
            {inventory?.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.sku}</td>
                <td>
                  {editingId === item.id ? (
                    <input placeholder="Enter stock quantity"
                      type="number" min="0" value={editValue} autoFocus
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveStock(item.id)}
                      onKeyDown={(e) => e.key === 'Enter' && saveStock(item.id)}
                      style={{ width: 70, padding: '4px 8px', background: 'var(--color-bg)', border: '1px solid var(--color-gold)', borderRadius: 4, color: 'var(--color-text-primary)' }}
                    />
                  ) : (
                    <button onClick={() => startEdit(item)} style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer', textDecoration: 'underline dotted' }}>
                      {item.stock}
                    </button>
                  )}
                </td>
                <td>
                  <span className={`${styles.badge} ${item.status === 'in_stock' ? styles.badgeSuccess : item.status === 'low_stock' ? styles.badgeWarn : styles.badgeError}`}>
                    {STATUS_LABEL[item.status]}
                  </span>
                </td>
                <td><button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.72rem' }} onClick={() => startEdit(item)}>Update Stock</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
