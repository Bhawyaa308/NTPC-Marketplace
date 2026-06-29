const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { swaggerSpec, swaggerUi } = require('./config/swagger');
const authRoutes = require('./routes/auth.routes');
const listingsRoutes = require('./routes/listings.routes');
const reservationsRoutes = require('./routes/reservations.routes');
const ordersRoutes = require('./routes/orders.routes');
const paymentsRoutes = require('./routes/payments.routes');
const adminRoutes = require('./routes/admin.routes');
const searchRoutes = require('./routes/search.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const chatRoutes = require('./routes/chat.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const categoriesRoutes = require('./routes/categories.routes');
const profileRoutes = require('./routes/profile.routes');
const reportsRoutes = require('./routes/reports.routes');
const settingsRoutes = require('./routes/settings.routes');
const transfersRoutes = require('./routes/transfers.routes');
const townshipsRoutes = require('./routes/townships.routes');
const superAdminRoutes = require('./routes/superAdmin.routes');

const app = express();
const cors = require("cors");

app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true,
  })
);
// Core middleware
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));
app.use(express.urlencoded({ extended: true }));

// Multer configuration for file uploads
const uploadDir = path.resolve(__dirname, '../uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const safeName = file.originalname.replace(/\s+/g, '-');
    cb(null, `${timestamp}-${random}-${safeName}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const extension = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const mimeType = file.mimetype ? file.mimetype.toLowerCase() : '';

    if (allowedTypes.includes(mimeType) || allowedExtensions.includes(extension)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed.'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// Store multer instance for route use
app.locals.upload = upload;

// Serve static files from uploads folder
app.use('/uploads', express.static(uploadDir));

// Swagger documentation endpoint
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/transfers', transfersRoutes);
app.use('/api/townships', townshipsRoutes);
app.use('/api/super-admin', superAdminRoutes);

// Fallback for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource does not exist',
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled application error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? 'Internal Server Error' : err.message,
  });
});

module.exports = app;
