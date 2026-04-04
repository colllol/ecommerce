# Hướng dẫn Fix Lỗi Login - Seed Admin User

## 🔴 Vấn đề
Database trên Render chưa có dữ liệu user hoặc password hash không đúng,导致 login trả về lỗi 401.

## ✅ Giải pháp nhanh nhất - Dùng API Endpoint tạm thời

Tôi đã tạo một API endpoint đặc biệt để seed admin user vào database.

---

## 📋 Bước 1: Push code lên GitHub

Đã push code với seed route. Render sẽ tự động deploy backend.

---

## 📋 Bước 2: Gọi API để seed admin user

**Sau khi backend deploy xong** (kiểm tra trên Render Dashboard → Deployments):

### Cách 1: Dùng curl (Command Line)

Mở terminal/command prompt và chạy:

```bash
curl -X POST https://ecommerce-backend-m1yz.onrender.com/api/seed/admin \
  -H "Content-Type: application/json" \
  -d "{\"secret_key\":\"seed-admin-2024\"}"
```

### Cách 2: Dùng Postman/Thunder Client

- **Method:** POST
- **URL:** `https://ecommerce-backend-m1yz.onrender.com/api/seed/admin`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "secret_key": "seed-admin-2024"
}
```

### Cách 3: Dùng Browser Console

Mở DevTools (F12) → Console tab và chạy:

```javascript
fetch('https://ecommerce-backend-m1yz.onrender.com/api/seed/admin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ secret_key: 'seed-admin-2024' })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
```

---

## 📋 Bước 3: Kiểm tra kết quả

Nếu thành công, bạn sẽ nhận được response:

```json
{
  "message": "Admin user seeded successfully",
  "user": {
    "email": "admin@example.com",
    "password": "123456",
    "roles": ["Admin"],
    "total_permissions": 22
  },
  "WARNING": "DELETE THIS ROUTE AFTER USE!"
}
```

---

## 📋 Bước 4: Login với thông tin admin

- **Email:** `admin@example.com`
- **Password:** `123456`

Vào trang login và thử đăng nhập!

---

## ⚠️ BƯỚC 5: XÓA SEED ROUTE (QUAN TRỌNG!)

**SAU KHI SEED XONG, PHẢI XÓA ROUTE NÀY ĐỂ BẢO MẬT!**

### Cách xóa:

1. **Sửa file** `backend/src/routes/index.js`:
   - Xóa dòng: `const seedRoutes = require('./seedRoutes');`
   - Xóa dòng: `router.use('/seed', seedRoutes);`

2. **Xóa file** `backend/src/routes/seedRoutes.js`

3. **Commit và push:**
   ```bash
   git add -A
   git commit -m "security: remove seed route after admin seeding"
   git push origin master
   ```

4. **Đợi Render deploy lại**

---

## 🔍 Troubleshooting

### Lỗi 503 "Không kết nối được database"
- Kiểm tra biến môi trường database trên Render
- Vào Render → ecommerce-backend → Environment
- Đảm bảo có các biến: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`

### Lỗi 403 "Unauthorized"
- Kiểm tra `secret_key` có đúng `seed-admin-2024` không

### Lỗi 500 khác
- Vào Render → ecommerce-backend → Logs
- Xem lỗi chi tiết và gửi screenshot cho tôi

---

## 📝 Thông tin tài khoản sau khi seed

| Email | Password | Role | Permissions |
|-------|----------|------|-------------|
| admin@example.com | 123456 | Admin | 22 permissions (full access) |

---

## ⚡ Quick Commands

```bash
# 1. Seed admin
curl -X POST https://ecommerce-backend-m1yz.onrender.com/api/seed/admin \
  -H "Content-Type: application/json" \
  -d "{\"secret_key\":\"seed-admin-2024\"}"

# 2. Test login
curl -X POST https://ecommerce-backend-m1yz.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@example.com\",\"password\":\"123456\"}"
```

---

**Chúc bạn thành công!** 🚀
