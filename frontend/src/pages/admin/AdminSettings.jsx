import { useEffect, useState } from 'react';
import { adminSettingsService } from '../../services/adminServices';
import { useToast } from '../../components/Toast';
import styles from './AdminTable.module.css';
import formStyles from '../account/AccountForm.module.css';

const TABS = [
  { key: 'store', label: 'Store', fields: [{ key: 'storeName', label: 'Store Name' }, { key: 'supportEmail', label: 'Support Email' }, { key: 'contactPhone', label: 'Contact Phone' }] },
  { key: 'shipping', label: 'Shipping', fields: [{ key: 'flatRate', label: 'Flat Rate ($)' }, { key: 'freeThreshold', label: 'Free Shipping Threshold ($)' }] },
  { key: 'tax', label: 'Tax', fields: [{ key: 'rate', label: 'Tax Rate (%)' }, { key: 'taxIncluded', label: 'Prices include tax (true/false)' }] },
  { key: 'order', label: 'Orders', fields: [{ key: 'autoConfirm', label: 'Auto-confirm orders (true/false)' }, { key: 'cancelWindowHours', label: 'Cancellation window (hours)' }] },
  { key: 'email', label: 'Email', fields: [{ key: 'fromName', label: 'From Name' }, { key: 'fromAddress', label: 'From Address' }] },
  { key: 'security', label: 'Security', fields: [{ key: 'sessionTimeoutMinutes', label: 'Session Timeout (minutes)' }, { key: 'require2fa', label: 'Require 2FA for admins (true/false)' }] },
  { key: 'theme', label: 'Theme', fields: [{ key: 'defaultMode', label: 'Default Theme (dark/light)' }, { key: 'accentColor', label: 'Accent Color (hex)' }] },
];

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('store');
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const load = () => adminSettingsService.get().then(({ settings }) => setSettings(settings)).catch(() => setSettings({}));
  useEffect(() => { load(); }, []);

  const tab = TABS.find((t) => t.key === activeTab);
  const values = settings?.[activeTab] || {};

  const updateField = (key, val) => {
    setSettings((s) => ({ ...s, [activeTab]: { ...s[activeTab], [key]: val } }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminSettingsService.update(activeTab, values);
      toast.success('Settings saved.');
    } catch (err) {
      toast.error(err.message || 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className={styles.header}><h1>Settings</h1></div>

      <div className={styles.toolbar}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className="btn btn-outline"
            style={{
              padding: '8px 16px', fontSize: '0.78rem',
              borderColor: activeTab === t.key ? 'var(--color-gold)' : undefined,
              color: activeTab === t.key ? 'var(--color-gold)' : undefined,
            }}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {settings === null ? (
        <div className={formStyles.card} style={{ maxWidth: 520 }}>
          <div className="skeleton" style={{ height: 16, width: '35%', marginBottom: 20 }} />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div className="skeleton" style={{ height: 10, width: '25%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 38, width: '100%' }} />
            </div>
          ))}
        </div>
      ) : (
        <form className={formStyles.card} onSubmit={handleSave} style={{ maxWidth: 520 }}>
          <h2>{tab.label} Settings</h2>
          {tab.fields.map((f) => (
            <label key={f.key} className={formStyles.field}>
              <span>{f.label}</span>
              <input placeholder={`Enter ${f.label}`} value={values[f.key] ?? ''} onChange={(e) => updateField(f.key, e.target.value)} />
            </label>
          ))}
          <button type="submit" className="btn btn-primary" style={{ width: 'fit-content' }} disabled={saving}>
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </form>
      )}
    </div>
  );
}
