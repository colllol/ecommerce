import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../shared/CartContext';

export default function CategoryPage() {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    const params = new URLSearchParams({ categoryId: id });
    if (search) params.set('q', search);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    axios.get(`/api/products?${params}`).then((res) => setProducts(res.data));
  }, [id, search, minPrice, maxPrice]);

  return (
    <div>
      <h2>Sản phẩm theo danh mục</h2>
      <div className="search-filter-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Tìm trong danh mục..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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

