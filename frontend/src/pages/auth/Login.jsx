
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Check } from '../../components/icons';
import AuthSplit from './AuthSplit';
import { useAuthStore } from '../../context/authStore';
import { useToast } from '../../components/Toast';
import GoogleButton from './GoogleButton';
import styles from './AuthForm.module.css';

export default function Login() {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const updateField = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));

    if (error) setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      // Keep the existing authentication API contract.
      await login({
        email,
        password,
        remember,
      });

      toast.success('Welcome back to Luxora.');

      navigate(location.state?.from || '/account', {
        replace: true,
      });
    } catch (err) {
      const details = err?.details;

      const message = Array.isArray(details)
        ? details.map((item) => item.message).filter(Boolean).join(' ')
        : typeof details === 'string'
          ? details
          : err?.message || 'Unable to sign in. Please check your credentials.';

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplit
      image="https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1400&q=85"
      eyebrow="THE LUXORA EXPERIENCE"
      title="Welcome back."
      subtitle="Timeless design. Exceptional craftsmanship. Your personal collection awaits."
    >
      <form
        className={styles.form}
        onSubmit={handleSubmit}
        noValidate
      >
        <div>
          <p
            style={{
              margin: '0 0 10px',
              fontSize: '11px',
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
              opacity: 0.65,
            }}
          >
            MEMBER ACCESS
          </p>

          <h2
            style={{
              margin: '0 0 9px',
              fontSize: 'clamp(25px, 4vw, 32px)',
              fontWeight: 500,
              letterSpacing: '-0.8px',
            }}
          >
            Sign in to Luxora
          </h2>

          <p
            style={{
              margin: 0,
              fontSize: '14px',
              lineHeight: 1.7,
              opacity: 0.7,
            }}
          >
            Access your wishlist, orders and personal account.
          </p>
        </div>

        {error && (
          <div
            className={styles.error}
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}

        <label className={styles.field}>
          <span>Email Address</span>

          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={form.email}
            onChange={updateField('email')}
            required
            maxLength={254}
            disabled={loading}
          />
        </label>

        <label className={styles.field}>
          <span>Password</span>

          <div className={styles.passwordWrap}>
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              autoComplete="current-password"
              value={form.password}
              onChange={updateField('password')}
              required
              maxLength={128}
              disabled={loading}
            />

            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              disabled={loading}
            >
              {showPassword ? (
                <EyeOff size={17} strokeWidth={1.5} />
              ) : (
                <Eye size={17} strokeWidth={1.5} />
              )}
            </button>
          </div>
        </label>

        <div
          className={styles.row}
          style={{
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              disabled={loading}
            />

            <span>
              Remember me
              {remember && (
                <Check
                  size={13}
                  style={{ marginLeft: 5, verticalAlign: 'middle' }}
                />
              )}
            </span>
          </label>

          <Link
            to="/forgot-password"
            className={styles.link}
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{
            width: '100%',
            minHeight: '49px',
            opacity: loading ? 0.75 : 1,
          }}
          disabled={loading}
        >
          {loading ? 'Signing you in…' : 'Sign In'}
        </button>

        <div className={styles.divider}>
          <span>OR CONTINUE WITH</span>
        </div>

        <GoogleButton
          onError={(message) => setError(message)}
        />

        <p className={styles.switch}>
          New to Luxora?{' '}
          <Link to="/signup">Create your account</Link>
        </p>

        <p
          style={{
            margin: '8px 0 0',
            textAlign: 'center',
            fontSize: '11px',
            lineHeight: 1.7,
            opacity: 0.55,
          }}
        >
          YOUR TIME. YOUR STYLE. YOUR LUXORA.
        </p>
      </form>
    </AuthSplit>
  );
}