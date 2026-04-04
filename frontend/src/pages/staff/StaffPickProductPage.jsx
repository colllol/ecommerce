import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../config/api';

export default function StaffPickProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pickData, setPickData] = useState({ quantity: '', note: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchProduct = useCallback(async () => {
    try {
      const res = await api.get(`/api/products/${id}`);
      setProduct(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handlePickProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/inventory/pick-product', {
        productId: id,
        ...pickData,
      });
      alert('Xuất sản phẩm thành công');
      navigate('/staff/pick-products');
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || 'Không thể xuất sản phẩm'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="staff-page">Đang tải...</div>;
  if (!product) return <div className="staff-page">Không tìm thấy sản phẩm</div>;

  return (
    <div className="staff-page">
      <Link to="/staff/pick-products" className="back-link">← Quay lại</Link>

      <div className="pick-detail">
        <div className="pick-detail-image">
          <img src={product.image_url || 'https://via.placeholder.com/400'} alt={product.product_name} />
        </div>

        <div className="pick-detail-info">
          <h1>{product.product_name}</h1>
          <p className="sku">SKU: {product.sku}</p>
          <p className="price">{Number(product.price).toLocaleString()} đ</p>
          <p className="stock">
            Còn trong kho: <strong>{product.stock_quantity || 0}</strong>
          </p>
          <p className="description">{product.description || product.short_description || 'Không có mô tả'}</p>

          <form onSubmit={handlePickProduct} className="pick-form">
            <h2>Xuất sản phẩm</h2>
            <div className="form-group">
              <label>Số lượng xuất</label>
              <input
                type="number"
                value={pickData.quantity}
                onChange={(e) => setPickData({ ...pickData, quantity: e.target.value })}
                required
                min="1"
                max={product.stock_quantity || 0}
                placeholder="Nhập số lượng"
              />
            </div>
            <div className="form-group">
              <label>Ghi chú</label>
              <textarea
                value={pickData.note}
                onChange={(e) => setPickData({ ...pickData, note: e.target.value })}
                rows="3"
                placeholder="Lý do xuất kho..."
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/staff/pick-products')}>
                Hủy
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Đang xử lý...' : 'Xác nhận xuất'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .staff-page {
          padding: 1.5rem;
        }
        .back-link {
          display: inline-block;
          margin-bottom: 1rem;
          color: #007bff;
          text-decoration: none;
          font-weight: 500;
        }
        .back-link:hover {
          text-decoration: underline;
        }
        .pick-detail {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 2rem;
          background: #fff;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .pick-detail-image {
          width: 100%;
          height: 300px;
          background: #f5f5f5;
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pick-detail-image img {
          max-width: 100%;
          max-height: 100%;
          object-fit: cover;
        }
        .pick-detail-info h1 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          color: #333;
        }
        .pick-detail-info .sku {
          font-size: 0.875rem;
          color: #666;
          margin-bottom: 0.5rem;
        }
        .pick-detail-info .price {
          font-size: 1.25rem;
          font-weight: bold;
          color: #007bff;
          margin-bottom: 0.5rem;
        }
        .pick-detail-info .stock {
          font-size: 1rem;
          color: #28a745;
          margin-bottom: 1rem;
        }
        .pick-detail-info .description {
          color: #666;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }
        .pick-form {
          background: #f9fafb;
          padding: 1.5rem;
          border-radius: 8px;
        }
        .pick-form h2 {
          font-size: 1.25rem;
          margin-bottom: 1rem;
          color: #333;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333;
        }
        .form-group input, .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }
        .form-group input:focus, .form-group textarea:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0,123,255,0.2);
        }
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }
        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s;
        }
        .btn-secondary {
          background: #6c757d;
          color: white;
        }
        .btn-secondary:hover {
          background: #5a6268;
        }
        .btn-primary {
          background: #007bff;
          color: white;
        }
        .btn-primary:hover {
          background: #0056b3;
        }
        .btn-primary:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        @media (max-width: 768px) {
          .pick-detail {
            grid-template-columns: 1fr;
          }
          .pick-detail-image {
            height: 200px;
          }
        }
      `}</style>
    </div>
  );
}
