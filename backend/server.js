require('./config/loadEnv');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const { pool } = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
const journalRoutes = require('./routes/journalRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const contactRoutes = require('./routes/contactRoutes');
const { sitemap } = require('./controllers/seoController');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/api', apiLimiter);

app.get('/sitemap.xml', sitemap);
app.get('/api/health', (req, res) => res.json({ success: true, message: 'LUXORA WATCHES API is running.' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`✔ LUXORA WATCHES API listening on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);

  // Non-blocking sanity check: confirm the database the app just connected to
  // actually has every table the routes depend on. Catches "ran migrate
  // against the wrong database" or "forgot to re-run migrate after pulling
  // new code" immediately, instead of as a random 500 later.
  try {
    const { rows } = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
    );
    const present = new Set(rows.map((r) => r.table_name));
    const required = [
      'users', 'products', 'product_images', 'orders', 'order_items', 'cart_items',
      'wishlist_items', 'reviews', 'coupons', 'admin_activity_log', 'notifications', 'settings',
    ];
    const missing = required.filter((t) => !present.has(t));
    if (missing.length) {
      console.warn(`⚠ Database is missing expected table(s): ${missing.join(', ')}.`);
      console.warn('  Run `npm run migrate` against the database in DATABASE_URL, then restart.');
    }
  } catch (err) {
    console.warn('⚠ Could not verify database tables on startup:', err.message);
  }
});
