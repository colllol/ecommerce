import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../config/api';
import { useCart } from '../shared/CartContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    api.get(`/api/products/${id}`).then((res) => setProduct(res.data));
  }, [id]);

  if (!product) return <div>Đang tải sản phẩm...</div>;

  return (
    <div className="detail">
      <img
        src={product.image_url || 'https://via.placeholder.com/400'}
        alt={product.product_name}
        className="detail-image"
      />
      <div className="detail-info">
        <h1>{product.product_name}</h1>
        <p className="price">{Number(product.price).toLocaleString()} đ</p>
        <p>{product.description || product.short_description}</p>
        <div className="row">
          <label className="qty">
            Số lượng
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
            />
          </label>
          <button
            className="btn-primary"
            onClick={() => {
              addToCart(product, qty);
            }}
          >
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>
    </div>
  );
}

