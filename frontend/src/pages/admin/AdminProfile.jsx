import { useEffect, useState } from 'react';
import { adminProfileService } from '../../services/adminServices';
import { useAuthStore } from '../../context/authStore';
import { useToast } from '../../components/Toast';
import AvatarUploader from '../../components/AvatarUploader';
import formStyles from '../account/AccountForm.module.css';

export default function AdminProfile() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const [admin, setAdmin] = useState(null);
  const [form, setForm] = useState({ fullName: '', email: '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const toast = useToast();

  useEffect(() => {
    adminProfileService.get().then(({ admin }) => {
      setAdmin(admin);
      setForm({ fullName: admin.full_name, email: admin.email });
    }).catch(() => {});
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { admin } = await adminProfileService.update(form);
      setAdmin(admin);
      await hydrate();
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(err.message || 'Could not update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirmPassword) return toast.error('New passwords do not match.');
    setSavingPw(true);
    try {
      await adminProfileService.changePassword(pw);
      toast.success('Password updated.');
      setPw({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.message || 'Could not update password.');
    } finally {
      setSavingPw(false);
    }
  };

  const removeAvatar = async () => {
    try {
      const { admin } = await adminProfileService.removeAvatar();
      setAdmin(admin);
      toast.success('Avatar removed.');
    } catch (err) {
      toast.error(err.message || 'Could not remove avatar.');
    }
  };

  if (!admin) {
    return (
      <div>
        <h1 style={{ fontSize: '1.8rem', marginBottom: 32 }}>Admin Profile</h1>
        <div className={formStyles.card} style={{ maxWidth: 480 }}>
          <div className="skeleton" style={{ width: 72, height: 72, borderRadius: '50%', marginBottom: 20 }} />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div className="skeleton" style={{ height: 10, width: '30%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 38, width: '100%' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', marginBottom: 32 }}>Admin Profile</h1>

      <form className={formStyles.card} onSubmit={handleProfileSubmit}>
        <h2>Personal Information</h2>
        <AvatarUploader
          avatarUrl={admin.avatar_url}
          name={admin.full_name}
          onUpload={async (file) => { const { admin: updated } = await adminProfileService.uploadAvatar(file); setAdmin(updated); await hydrate(); }}
          onRemove={removeAvatar}
        />
        <label className={formStyles.field}><span>Full Name</span><input placeholder="Enter your full name" value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} /></label>
        <label className={formStyles.field}><span>Email</span><input placeholder="Enter your email address" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></label>
        <div style={{ display: 'flex', gap: 24, fontSize: '0.82rem', color: 'var(--color-text-tertiary)' }}>
          <span>Role: <strong style={{ color: 'var(--color-gold)' }}>{admin.role}</strong></span>
          <span>Joined: {new Date(admin.created_at).toLocaleDateString()}</span>
          {admin.last_login_at && <span>Last login: {new Date(admin.last_login_at).toLocaleString()}</span>}
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: 'fit-content' }} disabled={savingProfile}>
          {savingProfile ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      <form className={formStyles.card} onSubmit={handlePasswordSubmit}>
        <h2>Change Password</h2>
        <label className={formStyles.field}><span>Current Password</span><input placeholder="Enter your current password" type="password" value={pw.currentPassword} onChange={(e) => setPw((f) => ({ ...f, currentPassword: e.target.value }))} /></label>
        <label className={formStyles.field}><span>New Password</span><input placeholder="Create your new password" type="password" value={pw.newPassword} onChange={(e) => setPw((f) => ({ ...f, newPassword: e.target.value }))} /></label>
        <label className={formStyles.field}><span>Confirm New Password</span><input placeholder="Confirm your new password" type="password" value={pw.confirmPassword} onChange={(e) => setPw((f) => ({ ...f, confirmPassword: e.target.value }))} /></label>
        <button type="submit" className="btn btn-outline" style={{ width: 'fit-content' }} disabled={savingPw}>
          {savingPw ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
