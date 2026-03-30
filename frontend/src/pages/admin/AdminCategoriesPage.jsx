import React, { useEffect, useState } from 'react';
import { categoriesApi } from '../../services/adminApi';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({
    category_name: '',
    slug: '',
    parent_category_id: '',
    description: '',
    is_active: 1,
  });
  const [error, setError] = useState('');

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await categoriesApi.getAll();
      setCategories(res.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const slugify = (str) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const openCreate = () => {
    setForm({ category_name: '', slug: '', parent_category_id: '', description: '', is_active: 1 });
    setError('');
    setModal('create');
  };

  const openEdit = (cat) => {
    setForm({
      category_name: cat.category_name,
      slug: cat.slug,
      parent_category_id: cat.parent_category_id || '',
      description: cat.description || '',
      is_active: cat.is_active ?? 1,
    });
    setError('');
    setModal({ type: 'edit', category: cat });
  };

  const openDelete = (cat) => {
    setModal({ type: 'delete', category: cat });
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.category_name) {
      setError('Tên danh mục là bắt buộc');
      return;
    }
    try {
      const data = {
        category_name: form.category_name,
        slug: form.slug || slugify(form.category_name),
        parent_category_id: form.parent_category_id || null,
        description: form.description || null,
        is_active: form.is_active,
      };
      await categoriesApi.create(data);
      setModal(null);
      loadCategories();
    } catch (e) {
      setError(e.response?.data?.message || 'Lỗi tạo danh mục');
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.category_name) {
      setError('Tên danh mục là bắt buộc');
      return;
    }
    try {
      const data = {
        category_name: form.category_name,
        slug: form.slug || slugify(form.category_name),
        parent_category_id: form.parent_category_id || null,
        description: form.description || null,
        is_active: form.is_active,
      };
      await categoriesApi.update(modal.category.category_id, data);
      setModal(null);
      loadCategories();
    } catch (e) {
      setError(e.response?.data?.message || 'Lỗi cập nhật');
    }
  };

  const handleDelete = async () => {
    try {
      await categoriesApi.delete(modal.category.category_id);
      setModal(null);
      loadCategories();
    } catch (e) {
      setError(e.response?.data?.message || 'Lỗi xóa');
    }
  };

  const filteredCategories = categories.filter((c) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return [c.category_name, c.slug].some((v) => v && String(v).toLowerCase().includes(term));
  });

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2>Quản lý danh mục</h2>
        <button className="btn btn-primary" onClick={openCreate}>
          Thêm danh mục
        </button>
      </div>

      <div className="admin-search-filter">
        <input
          type="text"
          placeholder="Tìm theo tên, slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên danh mục</th>
              <th>Slug</th>
              <th>Danh mục cha</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map((c) => (
              <tr key={c.category_id}>
                <td>{c.category_id}</td>
                <td>{c.category_name}</td>
                <td>{c.slug}</td>
                <td>{c.parent_category_id ? categories.find((x) => x.category_id === c.parent_category_id)?.category_name || c.parent_category_id : '-'}</td>
                <td>{c.is_active ? 'Hiển thị' : 'Ẩn'}</td>
                <td>
                  <button className="btn-small btn-edit" onClick={() => openEdit(c)}>Sửa</button>
                  <button className="btn-small btn-danger" onClick={() => openDelete(c)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modal === 'create' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Thêm danh mục</h3>
            <form onSubmit={handleSubmitCreate} className="form-grid">
              <label>
                Tên danh mục <span className="required">*</span>
                <input
                  value={form.category_name}
                  onChange={(e) => setForm({ ...form, category_name: e.target.value, slug: form.slug || slugify(e.target.value) })}
                  required
                />
              </label>
              <label>
                Slug
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Tự sinh nếu để trống" />
              </label>
              <label>
                Danh mục cha
                <select value={form.parent_category_id} onChange={(e) => setForm({ ...form, parent_category_id: e.target.value })}>
                  <option value="">-- Không --</option>
                  {categories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                  ))}
                </select>
              </label>
              <label className="form-full">
                Mô tả
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
              </label>
              <label>
                Hiển thị
                <select value={form.is_active} onChange={(e) => setForm({ ...form, is_active: Number(e.target.value) })}>
                  <option value={1}>Có</option>
                  <option value={0}>Không</option>
                </select>
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
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Sửa danh mục</h3>
            <form onSubmit={handleSubmitEdit} className="form-grid">
              <label>
                Tên danh mục <span className="required">*</span>
                <input value={form.category_name} onChange={(e) => setForm({ ...form, category_name: e.target.value })} required />
              </label>
              <label>
                Slug
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </label>
              <label>
                Danh mục cha
                <select value={form.parent_category_id} onChange={(e) => setForm({ ...form, parent_category_id: e.target.value })}>
                  <option value="">-- Không --</option>
                  {categories.filter((c) => c.category_id !== modal.category.category_id).map((c) => (
                    <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                  ))}
                </select>
              </label>
              <label className="form-full">
                Mô tả
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
              </label>
              <label>
                Hiển thị
                <select value={form.is_active} onChange={(e) => setForm({ ...form, is_active: Number(e.target.value) })}>
                  <option value={1}>Có</option>
                  <option value={0}>Không</option>
                </select>
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
            <h3>Xóa danh mục</h3>
            <p>Bạn có chắc muốn xóa <strong>{modal.category.category_name}</strong>?</p>
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
