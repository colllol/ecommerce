import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';
import { useCart } from '../shared/CartContext';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    api.get('/api/categories').then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (categoryId) params.set('categoryId', categoryId);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    api.get(`/api/products?${params}`).then((res) => setProducts(res.data));
  }, [search, categoryId, minPrice, maxPrice]);

  return (
    <div>
      <h2>Sản phẩm nổi bật</h2>
      <div className="search-filter-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Tìm sản phẩm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
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
        />
        <input
          type="number"
          placeholder="Giá đến (đ)"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          min="0"
        />
      </div>
      <div className="product-grid">
        {products.map((p) => (
          <div key={p.product_id} className="product-card">
            <img src={p.image_url || 'https://via.placeholder.com/200'} alt={p.product_name} />
            <h3>{p.product_name}</h3>
            <p className="price">{Number(p.price).toLocaleString()} đ</p>
            <div className="actions">
              <Link to={`/products/${p.product_id}`} className="btn">
                Xem chi tiết
              </Link>
              <button className="btn-primary" onClick={() => addToCart(p, 1)}>
                Thêm giỏ
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

