# Hướng dẫn Fix Lỗi CORS

## 🔴 Vấn đề

Frontend đang gọi đúng backend URL nhưng bị chặn bởi CORS policy:
```
Access-Control-Allow-Origin header is present on the requested resource
```

## ✅ Giải pháp

Backend cần được cấu hình để cho phép frontend Vercel truy cập.

---

## Cách 1: Cấu hình qua Render Dashboard (KHUYẾN NGHỊ)

### Bước 1: Thêm biến môi trường trên Render

1. Truy cập: https://dashboard.render.com/
2. Chọn service **ecommerce-backend**
3. Vào tab **Environment**
4. Nhấn **Add Environment Variable**
5. Điền:
   - **Key:** `FRONTEND_URL`
   - **Value:** `https://ecommerce-epf97l6c7-colllois-projects.vercel.app`
6. Nhấn **Save**
7. Render sẽ tự động redeploy backend

### Bước 2: Kiểm tra

Sau khi backend deploy xong:
1. Reload frontend
2. Mở DevTools → Console
3. Không còn lỗi CORS nữa ✅

---

## Cách 2: Sửa code backend (cho phép tất cả - chỉ dùng cho test)

Nếu bạn muốn cho phép TẤT CẢ origin (KHÔNG khuyến nghị cho production):

File `backend/src/server.js` đã có cấu hình CORS:

```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',')
    : '*',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
```

**Nếu `FRONTEND_URL` không được set, nó sẽ dùng `*` (cho phép tất cả).**

Nhưng có thể backend của bạn đang cache biến môi trường cũ. Hãy thử:

1. Vào Render Dashboard → ecommerce-backend
2. Tab **Deployments**
3. Nhấn **⋯** → **Clear build cache & deploy**

---

## Cách 3: Hardcode tạm thời (chỉ để test nhanh)

Sửa file `backend/src/server.js`:

```javascript
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://ecommerce-epf97l6c7-colllois-projects.vercel.app'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
```

**Sau đó push code lên GitHub để Render deploy lại.**

---

## ✅ Checklist sau khi fix

- [ ] Đã thêm `FRONTEND_URL` vào Render environment variables
- [ ] Backend đã deploy lại thành công
- [ ] Frontend reload và không còn lỗi CORS
- [ ] Console không có lỗi "Access-Control-Allow-Origin"
- [ ] Network tab cho thấy request thành công (200 OK)

---

## 🔍 Troubleshooting

### Vẫn lỗi CORS sau khi thêm biến môi trường?

1. **Check backend logs trên Render:**
   - Vào Render Dashboard → ecommerce-backend → Logs
   - Tìm dòng log khi khởi động server
   - Kiểm tra xem có lỗi gì không

2. **Test backend trực tiếp:**
   - Mở browser và truy cập: `https://ecommerce-backend-m1yz.onrender.com/api/products`
   - Nếu thấy JSON response → backend đang chạy OK

3. **Clear cache frontend:**
   - Vercel Dashboard → Deployments → Redeploy
   - Hoặc mở DevTools → Application → Clear storage → Clear site data

4. **Kiểm tra domain chính xác:**
   - FRONTEND_URL phải khớp EXACT với domain Vercel
   - Không có dấu `/` ở cuối
   - Phải có `https://` ở đầu

---

## 📝 Cấu hình đúng

**Backend (Render):**
```
FRONTEND_URL=https://ecommerce-epf97l6c7-colllois-projects.vercel.app
```

**Frontend (Vercel):**
```
VITE_API_BASE_URL=https://ecommerce-backend-m1yz.onrender.com
```

---

## 🎯 Khuyến nghị cho Production

Khi deploy production, nên cấu hình cụ thể:

```
FRONTEND_URL=https://your-domain.com
```

Không nên dùng `*` trong production vì lý do bảo mật.
