import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import PageTransition from '../components/PageTransition';

export default function MainLayout() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '60vh' }}>
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
