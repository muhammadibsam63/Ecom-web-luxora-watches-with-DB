
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Check } from '../../components/icons';
import AuthSplit from './AuthSplit';
import GoogleButton from './GoogleButton';
import { useAuthStore } from '../../context/authStore';
import { useToast } from '../../components/Toast';
import styles from './AuthForm.module.css';

function getStrength(password) {
  if (!password) return 0;

  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  return score;
}

const STRENGTH_LABELS = [
  'Enter a password',
  'Weak',
  'Fair',
  'Strong',
  'Very Strong',
];

export default function Signup() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const signup = useAuthStore((state) => state.signup);
  const navigate = useNavigate();
  const toast = useToast();

  const strength = useMemo(
    () => getStrength(form.password),
    [form.password]
  );

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

    const fullName = form.fullName.trim();
    const email = form.email.trim().toLowerCase();

    if (fullName.length < 2) {
      setError('Please enter your full name.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (form.password.length < 8) {
      setError('Your password must contain at least 8 characters.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Your passwords do not match.');
      return;
    }

    if (!agreed) {
      setError('Please accept the Terms of Service to continue.');
      return;
    }

    setLoading(true);

    try {
      await signup({
        fullName,
        email,
        password: form.password,
      });

      toast.success('Welcome to Luxora.');
      navigate('/account', { replace: true });
    } catch (err) {
      const details = err?.details;

      const message = Array.isArray(details)
        ? details.map((item) => item.message).filter(Boolean).join(' ')
        : typeof details === 'string'
          ? details
          : err?.message || 'We could not create your account. Please try again.';

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplit
      image="https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=1400&q=85"
      eyebrow="JOIN LUXORA"
      title="A more refined experience."
      subtitle="Create your account to discover timeless design, manage your wishlist and keep track of your orders."
    >
      <form
        className={styles.form}
        onSubmit={handleSubmit}
        noValidate
      >
        <div>
          <p
            style={{
              margin: '0 0 8px',
              fontSize: '11px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              opacity: 0.7,
            }}
          >
            LUXORA MEMBERSHIP
          </p>

          <h2 style={{ margin: '0 0 8px', fontSize: '28px' }}>
            Create your account
          </h2>

          <p style={{ margin: 0, opacity: 0.7, fontSize: '14px' }}>
            Your journey into refined timekeeping starts here.
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
          <span>Full Name</span>
          <input
            name="fullName"
            type="text"
            placeholder="Enter your full name"
            autoComplete="name"
            value={form.fullName}
            onChange={updateField('fullName')}
            required
            minLength={2}
            maxLength={100}
            disabled={loading}
          />
        </label>

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
              placeholder="Create a secure password"
              autoComplete="new-password"
              value={form.password}
              onChange={updateField('password')}
              required
              minLength={8}
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

          {form.password && (
            <div
              className={styles.strengthWrap}
              aria-live="polite"
            >
              <div className={styles.strengthBars}>
                {[1, 2, 3, 4].map((level) => (
                  <span
                    key={level}
                    className={styles.strengthBar}
                    data-active={level <= strength}
                    data-level={strength}
                  />
                ))}
              </div>

              <span className={styles.strengthLabel}>
                {STRENGTH_LABELS[strength]}
              </span>
            </div>
          )}

          <p style={{ margin: '6px 0 0', fontSize: '12px', opacity: 0.65 }}>
            Use at least 8 characters for your password.
          </p>
        </label>

        <label className={styles.field}>
          <span>Confirm Password</span>

          <div className={styles.passwordWrap}>
            <input
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={updateField('confirmPassword')}
              required
              maxLength={128}
              disabled={loading}
            />

            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() =>
                setShowConfirmPassword((visible) => !visible)
              }
              aria-label={
                showConfirmPassword
                  ? 'Hide confirmation password'
                  : 'Show confirmation password'
              }
              aria-pressed={showConfirmPassword}
              disabled={loading}
            >
              {showConfirmPassword ? (
                <EyeOff size={17} strokeWidth={1.5} />
              ) : (
                <Eye size={17} strokeWidth={1.5} />
              )}
            </button>
          </div>

          {form.confirmPassword &&
            form.password === form.confirmPassword && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '7px',
                  fontSize: '12px',
                  color: '#719b7b',
                }}
              >
                <Check size={14} />
                Passwords match
              </span>
            )}
        </label>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) => {
              setAgreed(event.target.checked);
              if (error) setError('');
            }}
            required
            disabled={loading}
          />

          <span>
            I agree to the <Link to="/terms">Terms of Service</Link> and{' '}
            <Link to="/privacy">Privacy Policy</Link>.
          </span>
        </label>

        <button
          type="submit"
          className="btn btn-primary"
          style={{
            width: '100%',
            minHeight: '48px',
            opacity: loading ? 0.7 : 1,
          }}
          disabled={loading}
        >
          {loading ? 'Creating your account…' : 'Create Account'}
        </button>

        <div className={styles.divider}>
          <span>Or continue with</span>
        </div>

        <GoogleButton onError={(message) => setError(message)} />

        <p className={styles.switch}>
          Already a member? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </AuthSplit>
  );
}