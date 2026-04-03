import { Link, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CategoryPage from './pages/CategoryPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ProfileUserPage from './pages/ProfileUserPage';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';

function UserLayout({ children }) {
  return (
    <div>
      <Header />
      <main className="main">{children}</main>
      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-col">
            <h4>Về chúng tôi</h4>
            <p>Ecommerce - Cửa hàng trực tuyến uy tín, giao hàng nhanh chóng toàn quốc với hàng ngàn sản phẩm chất lượng.</p>
          </div>
          <div className="footer-col">
            <h4>Liên hệ</h4>
            <p>📧 support@ecommerce.vn</p>
            <p>📞 Hotline: 1900 xxxx</p>
            <p>📍 số 28, đường Lê Trọng Tấn, quận Hà Đông, Tp.Hà Nội</p>
          </div>
          <div className="footer-col">
            <h4>Hỗ trợ</h4>
            <Link to="/">Hướng dẫn mua hàng</Link>
            <Link to="/">Chính sách đổi trả</Link>
            <Link to="/">Thanh toán & Vận chuyển</Link>
            <Link to="/">Câu hỏi thường gặp</Link>
          </div>
          <div className="footer-col">
            <h4>Theo dõi</h4>
            <p>Kết nối với chúng tôi qua mạng xã hội để nhận ưu đãi mới nhất.</p>
          </div>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} Ecommerce. Bản quyền thuộc về Ecommerce.
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <UserLayout>
      <Routes>
        {/* Login page */}
        <Route
          path="login"
          element={
            <div className="full-page">
              <LoginPage />
            </div>
          }
        />

        {/* Public routes for customers */}
        <Route index element={<HomePage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="categories/:id" element={<CategoryPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />

        {/* Protected route for user profile */}
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfileUserPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </UserLayout>
  );
}
