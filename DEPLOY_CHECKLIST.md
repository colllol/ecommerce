# ⚡ Quick Deploy Checklist

## Trước khi deploy

- [ ] Code đã commit và push lên GitHub (`git push origin main`)
- [ ] `backend/.env` đã có trong `.gitignore` (KHÔNG commit secrets!)
- [ ] Backend build locally: `cd backend && npm run build` (nếu có) hoặc `npm start`
- [ ] Frontend build locally: `cd frontend && npm run build`
- [ ] Tất cả tests pass: `npm run lint` ở cả 2 thư mục

---

## Bước 1: Railway (Database)

| Step | Action | Status |
|------|--------|--------|
| 1.1 | Tạo account tại railway.app | ☐ |
| 1.2 | New Project → Add MySQL | ☐ |
| 1.3 | Copy 5 variables: HOST, PORT, USER, PASSWORD, DATABASE | ☐ |
| 1.4 | Import `ecommerce_db.sql` qua MySQL Workbench | ☐ |
| 1.5 | Import `backend/scripts/rbac-migration.sql` | ☐ |
| 1.6 | Update tất cả passwords = `123456` | ☐ |
| 1.7 | Generate Static Domain cho MySQL | ☐ |

---

## Bước 2: Render (Backend)

| Step | Action | Status |
|------|--------|--------|
| 2.1 | Tạo account tại render.com | ☐ |
| 2.2 | New → Web Service → Connect GitHub repo `ecommerce` | ☐ |
| 2.3 | Root Directory = `backend`, Runtime = Node | ☐ |
| 2.4 | Build = `npm install`, Start = `npm start` | ☐ |
| 2.5 | Add 9 environment variables (xem bảng bên dưới) | ☐ |
| 2.6 | Deploy → Copy Service URL | ☐ |
| 2.7 | Chạy `npm run setup:rbac` qua Shell tab | ☐ |
| 2.8 | Test: `curl https://<url>/api/auth/login` | ☐ |

**Environment Variables cho Backend:**
```
NODE_ENV=production
PORT=4000
DB_HOST=<từ Railway>
DB_PORT=<từ Railway>
DB_USER=root
DB_PASSWORD=<từ Railway>
DB_NAME=<từ Railway>
JWT_SECRET=<node -e "crypto.randomBytes(32).toString('hex')">
JWT_EXPIRES_IN=1d
FRONTEND_URL=(để trống, điền sau)
```

---

## Bước 3: Vercel (Frontend)

| Step | Action | Status |
|------|--------|--------|
| 3.1 | Tạo account tại vercel.com | ☐ |
| 3.2 | Add New → Project → Import GitHub repo `ecommerce` | ☐ |
| 3.3 | Root Directory = `frontend`, Framework = Vite | ☐ |
| 3.4 | Build = `npm run build`, Output = `dist` | ☐ |
| 3.5 | Add env: `VITE_API_BASE_URL=https://<backend>.onrender.com` | ☐ |
| 3.6 | Deploy → Copy Production URL | ☐ |

---

## Bước 4: Kết nối Backend ↔ Frontend

| Step | Action | Status |
|------|--------|--------|
| 4.1 | Quay lại Render → Edit `FRONTEND_URL` = Vercel URL | ☐ |
| 4.2 | Render redeploy (tự động) | ☐ |
| 4.3 | Test login từ frontend | ☐ |
| 4.4 | Clear `localStorage` nếu có lỗi | ☐ |

---

## Bước 5: Kiểm tra tổng

| Test | URL | Expected | Status |
|------|-----|----------|--------|
| Backend health | `/<backend>/` | `{"message":"Ecommerce API running"}` | ☐ |
| Login API | `/<backend>/api/auth/login` | JWT token | ☐ |
| Frontend loads | `/<frontend>/` | Trang chủ hiện | ☐ |
| Login UI | `/<frontend>/login` | Login → redirect | ☐ |
| Admin page | `/<frontend>/admin` | Dashboard hiện | ☐ |
| No CORS errors | Browser DevTools | Console sạch | ☐ |

---

## URLs cần lưu

| Service | URL |
|---------|-----|
| Frontend | `https://__________________________________.vercel.app` |
| Backend | `https://__________________________________.onrender.com` |
| Database | `__________________________________:____` |

---

## Sau deploy - Nếu có lỗi

| Error | Nguyên nhân | Cách fix |
|-------|-------------|----------|
| CORS blocked | `FRONTEND_URL` sai | Sửa env var trên Render → redeploy |
| 500 Server Error | DB connection sai | Kiểm tra `DB_*` vars trên Render |
| 401 Unauthorized | JWT_SECRET khác nhau hoặc token expired | Clear localStorage, login lại |
| Blank page | Build error | Check Vercel build logs |
| API 404 | `VITE_API_BASE_URL` sai | Sửa env var trên Vercel → redeploy |
