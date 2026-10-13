import { useState } from 'react';
import { useAuthStore } from '../../context/authStore';
import { userService } from '../../services/shopServices';
import { useToast } from '../../components/Toast';
import AvatarUploader from '../../components/AvatarUploader';
import styles from './AccountForm.module.css';

export default function AccountProfile() {
  const user = useAuthStore((s) => s.user);
  const hydrate = useAuthStore((s) => s.hydrate);
  const toast = useToast();

  const [name, setName] = useState(user.full_name);
  const [savingProfile, setSavingProfile] = useState(false);

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingPw, setSavingPw] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await userService.updateProfile({ fullName: name });
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
    if (pw.newPassword !== pw.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    setSavingPw(true);
    try {
      await userService.changePassword(pw);
      toast.success('Password updated.');
      setPw({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.message || 'Could not update password.');
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div>
      <h1 className={styles.title}>Profile</h1>

      <form className={styles.card} onSubmit={handleProfileSubmit}>
        <h2>Personal Information</h2>
        <AvatarUploader
          avatarUrl={user.avatar_url}
          name={user.full_name}
          onUpload={async (file) => { await userService.uploadAvatar(file); await hydrate(); }}
          onRemove={async () => { await userService.removeAvatar(); await hydrate(); toast.success('Avatar removed.'); }}
        />
        <label className={styles.field}><span>Full Name</span><input placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label className={styles.field}><span>Email</span><input placeholder="Enter your email address" value={user.email} disabled /></label>
        <button type="submit" className="btn btn-primary" style={{ width: 'fit-content' }} disabled={savingProfile}>
          {savingProfile ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      <form className={styles.card} onSubmit={handlePasswordSubmit}>
        <h2>Change Password</h2>
        <label className={styles.field}><span>Current Password</span>
          <input placeholder="Enter your current password" type="password" value={pw.currentPassword} onChange={(e) => setPw((f) => ({ ...f, currentPassword: e.target.value }))} />
        </label>
        <label className={styles.field}><span>New Password</span>
          <input placeholder="Create your new password" type="password" value={pw.newPassword} onChange={(e) => setPw((f) => ({ ...f, newPassword: e.target.value }))} />
        </label>
        <label className={styles.field}><span>Confirm New Password</span>
          <input placeholder="Confirm your new password" type="password" value={pw.confirmPassword} onChange={(e) => setPw((f) => ({ ...f, confirmPassword: e.target.value }))} />
        </label>
        <button type="submit" className="btn btn-outline" style={{ width: 'fit-content' }} disabled={savingPw}>
          {savingPw ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
