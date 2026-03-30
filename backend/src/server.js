const express = require('express');
const cors = require('cors');
require('dotenv').config();
const apiRoutes = require('./routes');

const app = express();

app.use(cors());
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

