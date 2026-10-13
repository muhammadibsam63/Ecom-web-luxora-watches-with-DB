import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import Preloader from './components/Preloader';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';
import { useAuthStore } from './context/authStore';
import { useCartStore } from './context/cartStore';
import { useWishlistStore } from './context/wishlistStore';
import './styles/global.css';

function Root() {
  const [showPreloader, setShowPreloader] = useState(() => !sessionStorage.getItem('luxora-visited'));
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const user = useAuthStore((s) => s.user);
  const fetchCart = useCartStore((s) => s.fetch);
  const fetchWishlist = useWishlistStore((s) => s.fetch);

  useEffect(() => {
    hydrateAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) {
      fetchCart();
      fetchWishlist();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handlePreloaderComplete = () => {
    sessionStorage.setItem('luxora-visited', '1');
  };

  return (
    <ThemeProvider>
      <ToastProvider>
        {showPreloader && (
          <Preloader onComplete={() => { handlePreloaderComplete(); setShowPreloader(false); }} />
        )}
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
