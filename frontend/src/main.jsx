import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import AppAdmin from './AppAdmin';
import AppStaff from './AppStaff';
import UnauthorizedPage from './pages/UnauthorizedPage';
import { AuthProvider } from './shared/AuthContext';
import { CartProvider } from './shared/CartContext';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/*" element={<App />} />
            <Route path="/admin/*" element={<AppAdmin />} />
            <Route path="/staff/*" element={<AppStaff />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
