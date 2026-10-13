import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Eye, EyeOff } from '../../components/icons';
import AuthSplit from './AuthSplit';
import { authService } from '../../services/authService';
import { useToast } from '../../components/Toast';
import styles from './AuthForm.module.css';

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    if (password !== confirm) return setError('Passwords do not match.');

    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      toast.success('Password reset. Please sign in.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'This reset link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplit
      image="https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?auto=format&fit=crop&w=1400&q=85"
      eyebrow="Reset Password"
      title="Create New Password"
      subtitle="Choose a new password for your account."
    >
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {error && <div className={styles.error}>{error}</div>}

        <label className={styles.field}>
          <span>New Password</span>
          <div className={styles.passwordWrap}>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              placeholder="Create your new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password visibility">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </label>

        <label className={styles.field}>
          <span>Confirm New Password</span>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="Confirm your new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
        </label>

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Resetting…' : 'Reset Password'}
        </button>
        <p className={styles.switch}>Back to <Link to="/login">Sign in</Link></p>
      </form>
    </AuthSplit>
  );
}
