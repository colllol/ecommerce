const express = require('express');
const cors = require('cors');
require('dotenv').config();
const apiRoutes = require('./routes');

const app = express();

// CORS configuration for production
// Allow multiple frontend URLs (Vercel deployments + localhost for development)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://ecommerce-epf97l6c7-colllols-projects.vercel.app',
  'https://ecommerce-tan-theta-10.vercel.app',
  'https://ecommerce-6873iwzh2-colllols-projects.vercel.app',
];

// Add FRONTEND_URL from env if exists
if (process.env.FRONTEND_URL) {
  const envOrigins = process.env.FRONTEND_URL.split(',').map(u => u.trim());
  allowedOrigins.push(...envOrigins);
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      console.log('Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Ecommerce API running' });
});

app.use('/api', apiRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Không tìm thấy API' });
});

// error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'JSON body không hợp lệ' });
  }

  const status = err?.statusCode || err?.status || 500;
  return res.status(status).json({ message: status === 500 ? 'Lỗi server' : 'Yêu cầu không hợp lệ' });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Ecommerce API listening on port ${PORT}`);
});
