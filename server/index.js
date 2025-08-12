require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin');
const leadFormRoutes = require('./routes/leadForm');
const orderFormRoutes = require('./routes/orderForm');
const userRoutes = require('./routes/user');

const app = express();

// ✅ Исправленная CORS конфигурация (добавлена запятая)
const allowedOrigins = [
  'http://localhost:3001',
  'http://localhost:5000',
  'http://192.168.71.145:5000',
  /^http:\/\/192\.168\.71\.\d+:5000$/
];

const corsOptions = {
  origin: (origin, callback) => {
    // ✅ Разрешаем запросы без origin (например, мобильные приложения)
    if (!origin) return callback(null, true);
    
    // ✅ Проверяем, разрешён ли origin
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked: ${origin}`);
      callback(new Error(`CORS policy: ${origin} not allowed`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// JWT middleware (добавляем проверку токена)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/lead', leadFormRoutes);
app.use('/api/order', orderFormRoutes);
app.use('/api/user', userRoutes);

// Защищенный тестовый роут
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Доступ разрешен', user: req.user });
});

// ✅ Раздача статики из build папки (только для production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../form-app/build')));
  
  // Все остальные роуты отдаём index.html (для React Router)
  app.get('/*splat', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../form-app/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
// ✅ Слушаем все интерфейсы для доступа из локальной сети
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  console.log(`📱 Test from other devices: http://YOUR_IP:${PORT}`);
});