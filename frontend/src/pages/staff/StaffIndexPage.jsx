import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../shared/AuthContext';

export default function StaffIndexPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get('/api/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('q', searchTerm);
      if (categoryId) params.set('categoryId', categoryId);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);

      const res = await axios.get(`/api/products?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [searchTerm, categoryId, minPrice, maxPrice, token]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (loading) return <div className="staff-page">Đang tải...</div>;

  return (
    <div className="staff-page">
      <h1>Xuất sản phẩm từ kho</h1>

      <div className="pick-section">
        <h2>Chọn sản phẩm để xuất</h2>
        
        {/* Filter Bar */}
        <div className="search-filter-bar">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="filter-select">
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Giá từ (đ)"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            min="0"
            className="filter-input"
          />
          <input
            type="number"
            placeholder="Giá đến (đ)"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            min="0"
            className="filter-input"
          />
        </div>

        <div className="products-grid">
          {products.map((product) => (
            <Link
              key={product.product_id}
              to={`/staff/pick-products/${product.product_id}`}
              className="product-card"
            >
              <div className="product-image">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.product_name} />
                ) : (
                  <div className="no-image">No Image</div>
                )}
              </div>
              <div className="product-info">
                <h3>{product.product_name}</h3>
                <p className="sku">SKU: {product.sku}</p>
                <p className="stock">
                  Còn: <strong>{product.available_quantity}</strong>
                </p>
                <p className="location">{product.warehouse_location || 'Không xác định'}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        .staff-page {
          padding: 1.5rem;
        }
        .staff-page h1 {
          margin-bottom: 1.5rem;
          color: #333;
        }
        .pick-section, .pick-form-section {
          background: #fff;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .pick-section h2, .pick-form-section h2 {
          margin-bottom: 1rem;
          color: #333;
        }
        .search-filter-bar {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .search-input, .filter-select, .filter-input {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.9rem;
        }
        .search-input {
          grid-column: 1 / -1;
        }
        .filter-select:focus, .filter-input:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0,123,255,0.2);
        }
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }
        .product-card {
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .product-card:hover {
          border-color: #007bff;
          box-shadow: 0 2px 8px rgba(0,123,255,0.2);
        }
        .product-card.selected {
          border-color: #28a745;
          background: #f0fff4;
        }
        .product-info h3 {
          font-size: 1rem;
          margin-bottom: 0.5rem;
          color: #333;
        }
        .product-info .sku {
          font-size: 0.75rem;
          color: #666;
          margin-bottom: 0.25rem;
        }
        .product-info .stock {
          font-size: 0.875rem;
          color: #28a745;
          margin-bottom: 0.25rem;
        }
        .product-info .location {
          font-size: 0.75rem;
          color: #999;
        }
        .product-image {
          width: 100%;
          height: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;
          border-radius: 4px;
          margin-bottom: 0.75rem;
          overflow: hidden;
        }
        .product-image img {
          max-width: 100%;
          max-height: 100%;
          object-fit: cover;
        }
        .no-image {
          color: #999;
          font-size: 0.875rem;
        }
        @media (max-width: 768px) {
          .search-filter-bar {
            grid-template-columns: 1fr;
          }
          .search-input {
            grid-column: 1;
          }
        }
      `}</style>
    </div>
  );
}
