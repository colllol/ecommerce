import React, { useEffect, useState } from 'react';
import { productsApi, categoriesApi } from '../../services/adminApi';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({
    category_id: '',
    product_name: '',
    slug: '',
    sku: '',
    short_description: '',
    description: '',
    price: '',
    discount_percent: 0,
    stock_quantity: 0,
    image_url: '',
    is_active: 1,
  });
  const [error, setError] = useState('');

  const loadProducts = async () => {
    setLoading(true);
    try {
      const [resProd, resCat] = await Promise.all([productsApi.getAll(), categoriesApi.getAll()]);
      setProducts(resProd.data);
      setCategories(resCat.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const slugify = (str) =>
    str
      ? str
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      : '';

  const openCreate = () => {
    setForm({
      category_id: categories[0]?.category_id || '',
      product_name: '',
      slug: '',
      sku: '',
      short_description: '',
      description: '',
      price: '',
      discount_percent: 0,
      stock_quantity: 0,
      image_url: '',
      is_active: 1,
    });
    setError('');
    setModal('create');
  };

  const openEdit = (prod) => {
    setForm({
      category_id: prod.category_id,
      product_name: prod.product_name,
      slug: prod.slug,
      sku: prod.sku || '',
      short_description: prod.short_description || '',
      description: prod.description || '',
      price: prod.price,
      discount_percent: prod.discount_percent || 0,
      stock_quantity: prod.stock_quantity || 0,
      image_url: prod.image_url || '',
      is_active: prod.is_active ?? 1,
    });
    setError('');
    setModal({ type: 'edit', product: prod });
  };

  const openDelete = (prod) => {
    setModal({ type: 'delete', product: prod });
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.product_name || !form.price) {
      setError('Tên và giá là bắt buộc');
      return;
    }
    if (!form.category_id) {
      setError('Vui lòng chọn danh mục');
      return;
    }
    try {
      const data = {
        category_id: Number(form.category_id),
        product_name: form.product_name,
        slug: form.slug || slugify(form.product_name),
        sku: form.sku || null,
        short_description: form.short_description || null,
        description: form.description || null,
        price: Number(form.price),
        discount_percent: Number(form.discount_percent) || 0,
        stock_quantity: Number(form.stock_quantity) || 0,
        image_url: form.image_url || null,
        is_active: form.is_active,
      };
      await productsApi.create(data);
      setModal(null);
      loadProducts();
    } catch (e) {
      setError(e.response?.data?.message || 'Lỗi tạo sản phẩm');
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.product_name || !form.price) {
      setError('Tên và giá là bắt buộc');
      return;
    }
    try {
      const data = {
        category_id: Number(form.category_id),
        product_name: form.product_name,
        slug: form.slug || slugify(form.product_name),
        sku: form.sku || null,
        short_description: form.short_description || null,
        description: form.description || null,
        price: Number(form.price),
        discount_percent: Number(form.discount_percent) || 0,
        stock_quantity: Number(form.stock_quantity) || 0,
        image_url: form.image_url || null,
        is_active: form.is_active,
      };
      await productsApi.update(modal.product.product_id, data);
      setModal(null);
      loadProducts();
    } catch (e) {
      setError(e.response?.data?.message || 'Lỗi cập nhật');
    }
  };

  const handleDelete = async () => {
    try {
      await productsApi.delete(modal.product.product_id);
      setModal(null);
      loadProducts();
    } catch (e) {
      setError(e.response?.data?.message || 'Lỗi xóa');
    }
  };

  const getCategoryName = (id) => categories.find((c) => c.category_id === id)?.category_name || id;

  const filteredProducts = products.filter((p) => {
    const matchSearch = !search || [p.product_name, p.sku, p.category_name].some(
      (v) => v && String(v).toLowerCase().includes(search.toLowerCase())
    );
    const matchCat = !filterCategory || p.category_id == filterCategory;
    const matchActive = !filterActive || (filterActive === '1' && p.is_active) || (filterActive === '0' && !p.is_active);
    return matchSearch && matchCat && matchActive;
  });

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2>Quản lý sản phẩm</h2>
        <button className="btn btn-primary" onClick={openCreate} disabled={categories.length === 0}>
          Thêm sản phẩm
        </button>
      </div>
      {categories.length === 0 && !loading && (
        <p className="info">Cần tạo ít nhất một danh mục trước khi thêm sản phẩm.</p>
      )}

      <div className="admin-search-filter">
        <input
          type="text"
          placeholder="Tìm theo tên, SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
          ))}
        </select>
        <select value={filterActive} onChange={(e) => setFilterActive(e.target.value)}>
          <option value="">Tất cả</option>
          <option value="1">Hiển thị</option>
          <option value="0">Ẩn</option>
        </select>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Danh mục</th>
              <th>Giá</th>
              <th>Tồn kho</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => (
              <tr key={p.product_id}>
                <td>{p.product_id}</td>
                <td>{p.product_name}</td>
                <td>{getCategoryName(p.category_id)}</td>
                <td>{Number(p.price).toLocaleString()} đ</td>
                <td>{p.stock_quantity}</td>
                <td>{p.is_active ? 'Hiển thị' : 'Ẩn'}</td>
                <td>
                  <button className="btn-small btn-edit" onClick={() => openEdit(p)}>Sửa</button>
                  <button className="btn-small btn-danger" onClick={() => openDelete(p)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modal === 'create' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <h3>Thêm sản phẩm</h3>
            <form onSubmit={handleSubmitCreate} className="form-grid">
              <label>
                Danh mục <span className="required">*</span>
                <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} required>
                  {categories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                  ))}
                </select>
              </label>
              <label>
                Tên sản phẩm <span className="required">*</span>
                <input
                  value={form.product_name}
                  onChange={(e) => setForm({ ...form, product_name: e.target.value, slug: form.slug || slugify(e.target.value) })}
                  required
                />
              </label>
              <label>
                Slug
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </label>
              <label>
                SKU
                <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              </label>
              <label>
                Giá (đ) <span className="required">*</span>
                <input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              </label>
              <label>
                Giảm giá (%)
                <input type="number" min="0" max="100" value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} />
              </label>
              <label>
                Tồn kho
                <input type="number" min="0" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} />
              </label>
              <label>
                URL ảnh
                <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
              </label>
              <label>
                Hiển thị
                <select value={form.is_active} onChange={(e) => setForm({ ...form, is_active: Number(e.target.value) })}>
                  <option value={1}>Có</option>
                  <option value={0}>Không</option>
                </select>
              </label>
              <label className="form-full">
                Mô tả ngắn
                <textarea value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} rows={2} />
              </label>
              <label className="form-full">
                Mô tả
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} />
              </label>
              {error && <p className="error form-full">{error}</p>}
              <div className="form-actions form-full">
                <button type="submit" className="btn btn-primary">Tạo</button>
                <button type="button" className="btn" onClick={() => setModal(null)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal?.type === 'edit' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <h3>Sửa sản phẩm</h3>
            <form onSubmit={handleSubmitEdit} className="form-grid">
              <label>
                Danh mục <span className="required">*</span>
                <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} required>
                  {categories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                  ))}
                </select>
              </label>
              <label>
                Tên sản phẩm <span className="required">*</span>
                <input value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })} required />
              </label>
              <label>
                Slug
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </label>
              <label>
                SKU
                <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              </label>
              <label>
                Giá (đ) <span className="required">*</span>
                <input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              </label>
              <label>
                Giảm giá (%)
                <input type="number" min="0" max="100" value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} />
              </label>
              <label>
                Tồn kho
                <input type="number" min="0" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} />
              </label>
              <label>
                URL ảnh
                <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
              </label>
              <label>
                Hiển thị
                <select value={form.is_active} onChange={(e) => setForm({ ...form, is_active: Number(e.target.value) })}>
                  <option value={1}>Có</option>
                  <option value={0}>Không</option>
                </select>
              </label>
              <label className="form-full">
                Mô tả ngắn
                <textarea value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} rows={2} />
              </label>
              <label className="form-full">
                Mô tả
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} />
              </label>
              {error && <p className="error form-full">{error}</p>}
              <div className="form-actions form-full">
                <button type="submit" className="btn btn-primary">Cập nhật</button>
                <button type="button" className="btn" onClick={() => setModal(null)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal?.type === 'delete' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal modal-confirm" onClick={(e) => e.stopPropagation()}>
            <h3>Xóa sản phẩm</h3>
            <p>Bạn có chắc muốn xóa <strong>{modal.product.product_name}</strong>?</p>
            {error && <p className="error">{error}</p>}
            <div className="form-actions">
              <button className="btn btn-danger" onClick={handleDelete}>Xóa</button>
              <button className="btn" onClick={() => setModal(null)}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
