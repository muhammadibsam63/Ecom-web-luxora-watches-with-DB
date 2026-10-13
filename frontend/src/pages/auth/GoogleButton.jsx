import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../context/authStore';
import { useToast } from '../../components/Toast';
import { Google } from '../../components/icons';
import styles from './AuthForm.module.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Renders Google's real "Sign in with Google" button via Google Identity
// Services. If no client ID is configured, shows a disabled state with
// a clear explanation instead of faking the integration.
export default function GoogleButton({ onError }) {
  const btnRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    if (window.google?.accounts?.id) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !GOOGLE_CLIENT_ID || !btnRef.current) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async ({ credential }) => {
        try {
          await loginWithGoogle(credential);
          toast.success('Welcome back.');
          navigate('/account');
        } catch (err) {
          onError?.(err.message || 'Google sign-in failed.');
        }
      },
    });

    window.google.accounts.id.renderButton(btnRef.current, {
      theme: 'outline',
      size: 'large',
      width: btnRef.current.offsetWidth,
      text: 'continue_with',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptLoaded]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className={styles.googleDisabled}>
        <span><Google size={14} style={{ marginRight: 8 }} />Continue with Google is not yet configured.</span>
        <small>Set VITE_GOOGLE_CLIENT_ID (frontend) and GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET (backend) to enable it.</small>
      </div>
    );
  }

  return <div ref={btnRef} className={styles.googleBtnMount} />;
}
