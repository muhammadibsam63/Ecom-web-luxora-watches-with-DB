
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

// CORS: local development + production + this project's Vercel previews
const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://ecom-web-luxora-watches-with-db.vercel.app',
  'https://ecom-web-luxora-watches-with-db-bsq.vercel.app',
]);

if (process.env.CLIENT_URL) {
  allowedOrigins.add(process.env.CLIENT_URL.replace(/\/+$/, ''));
}

function isAllowedOrigin(origin) {
  if (allowedOrigins.has(origin)) return true;

  // Only allow preview URLs belonging to this exact Vercel project.
  return /^https:\/\/ecom-web-luxora-watches-with-db-[a-z0-9]+\.vercel\.app$/.test(
    origin
  );
}

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without an Origin header (e.g. server-to-server).
      if (!origin || isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      console.warn(`CORS blocked origin: ${origin}`);
      return callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(helmet());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'LUXORA WATCHES API is running.',
  });
});

app.use('/api', apiLimiter);

app.get('/sitemap.xml', sitemap);

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

// Keep unknown-route and application error handling.
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(
    `LUXORA WATCHES API listening on port ${PORT} [${process.env.NODE_ENV || 'development'}]`
  );

  try {
    const { rows } = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);

    const present = new Set(rows.map((row) => row.table_name));

    const required = [
      'users',
      'products',
      'product_images',
      'orders',
      'order_items',
      'cart_items',
      'wishlist_items',
      'reviews',
      'coupons',
      'admin_activity_log',
      'notifications',
      'settings',
    ];

    const missing = required.filter((table) => !present.has(table));

    if (missing.length) {
      console.warn(
        `Database is missing expected table(s): ${missing.join(', ')}.`
      );
      console.warn(
        'Check your existing database migrations before running any migration.'
      );
    }
  } catch (err) {
    console.warn('Could not verify database tables on startup:', err.message);
  }
});

module.exports = app;
