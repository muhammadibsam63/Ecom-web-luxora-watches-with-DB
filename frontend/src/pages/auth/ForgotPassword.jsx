import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthSplit from './AuthSplit';
import { authService } from '../../services/authService';
import styles from './AuthForm.module.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message || 'Could not send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplit
      image="https://images.unsplash.com/photo-1622434641406-a158123450f9?auto=format&fit=crop&w=1400&q=85"
      eyebrow="Reset Password"
      title="Forgot Password?"
      subtitle="Enter your email and we'll send you a link to reset it."
    >
      {sent ? (
        <div className={styles.form}>
          <div className={styles.error} style={{ background: 'rgba(127,174,130,0.1)', borderColor: 'var(--color-success)', color: 'var(--color-success)' }}>
            If an account exists for that email, a reset link is on its way. Check your inbox.
          </div>
          <Link to="/login" className="btn btn-outline" style={{ width: '100%', textAlign: 'center' }}>Back to Sign In</Link>
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {error && <div className={styles.error}>{error}</div>}
          <label className={styles.field}>
            <span>Email</span>
            <input type="email" required placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </label>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
          <p className={styles.switch}>Remembered it? <Link to="/login">Sign in</Link></p>
        </form>
      )}
    </AuthSplit>
  );
}
