# Cập nhật: Chức năng hủy đơn hàng cho User

## Đã thực hiện

### 1. Frontend - ProfileUserPage.jsx

#### Thêm state mới:
```javascript
const [deletingId, setDeletingId] = useState(null);
```

#### Thêm hàm handleDeleteOrder:
```javascript
const handleDeleteOrder = async (orderId) => {
  if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
  
  setDeletingId(orderId);
  try {
    await axios.delete(`/api/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    alert('Đã hủy đơn hàng thành công');
    setOrders(orders.filter(o => o.order_id !== orderId));
  } catch (err) {
    alert('Lỗi: ' + (err.response?.data?.message || 'Không thể hủy đơn hàng'));
  } finally {
    setDeletingId(null);
  }
};
```

#### UI Updates:
- Hiển thị nút "Hủy đơn hàng" chỉ khi đơn ở trạng thái `pending`
- Nút hiển thị "Đang hủy..." khi đang xử lý
- Nút bị disable khi đang xử lý
- Style riêng cho khu vực action buttons

#### CSS Styles added:
```css
.order-actions {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}
.btn-danger:hover:not(:disabled) {
  background: #dc2626;
}
.btn-danger:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
```

### 2. Backend - OrderController

#### Cập nhật hàm remove:
```javascript
async remove(req, res) {
  const { id } = req.params;
  
  // Check if order exists and belongs to current user
  const order = await OrderModel.findById(id);
  if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
  
  // If not admin, check if user owns this order
  if (req.user.role !== 'admin' && order.user_id !== req.user.user_id) {
    return res.status(403).json({ message: 'Bạn không có quyền xóa đơn hàng này' });
  }
  
  // Check if order status is pending (only pending orders can be cancelled)
  if (req.user.role !== 'admin' && order.order_status !== 'pending') {
    return res.status(400).json({ message: 'Chỉ có thể hủy đơn hàng ở trạng thái "Chờ xác nhận"' });
  }
  
  const ok = await OrderModel.remove(id);
  return res.json({ success: true });
}
```

### 3. Backend - Order Routes

#### Cập nhật route:
```javascript
// Khách hàng có thể xóa đơn của mình (chỉ khi pending)
router.delete('/:id', authenticate, OrderController.remove);

// Admin quản lý tất cả đơn (không cần authorizeAdmin cho delete)
```

## Logic phân quyền

### User thường:
- ✅ Có thể xóa đơn của chính mình
- ✅ Chỉ xóa được khi status = `pending` (Chờ xác nhận)
- ❌ Không thể xóa đơn đã xác nhận, đang giao, hoàn thành, hoặc đã hủy
- ❌ Không thể xóa đơn của người khác

### Admin:
- ✅ Có thể xóa bất kỳ đơn hàng nào
- ✅ Không bị giới hạn bởi status

## Flow hoạt động

```
User click "Hủy đơn hàng"
        ↓
Xác nhận confirm dialog
        ↓
Gọi API DELETE /api/orders/:id
        ↓
Backend kiểm tra:
├─ Order tồn tại?
├─ User có quyền? (owner hoặc admin)
└─ Status = pending? (nếu không phải admin)
        ↓
    ┌───┴───┐
    │       │
    ▼       ▼
  Đạt    Không đạt
    │       │
    │       ▼
    │   Trả về lỗi 400/403
    │
    ▼
Xóa đơn hàng
    ↓
Cập nhật UI (remove khỏi list)
    ↓
Hiển thị thông báo thành công
```

## Các trạng thái đơn hàng

| Status | Có thể hủy? | Ghi chú |
|--------|-------------|---------|
| `pending` | ✅ Có | Chờ xác nhận |
| `confirmed` | ❌ Không | Đã xác nhận |
| `shipping` | ❌ Không | Đang giao |
| `completed` | ❌ Không | Hoàn thành |
| `cancelled` | ❌ Không | Đã hủy |

## Error Messages

1. **Không tìm thấy đơn hàng**
   - Status: 404
   - Message: "Không tìm thấy đơn hàng"

2. **Không có quyền**
   - Status: 403
   - Message: "Bạn không có quyền xóa đơn hàng này"

3. **Đơn không ở trạng thái pending**
   - Status: 400
   - Message: "Chỉ có thể hủy đơn hàng ở trạng thái 'Chờ xác nhận'"

4. **Lỗi server**
   - Status: 500
   - Message: "Lỗi server"

## Build Status

✅ **Frontend**: Build successful
- 106 modules transformed
- No errors

✅ **Backend**: No syntax errors

## Testing

### Test cases:

1. **User hủy đơn pending của chính mình**
   - ✅ Thành công

2. **User hủy đơn confirmed của chính mình**
   - ❌ Thất bại với message: "Chỉ có thể hủy đơn hàng ở trạng thái 'Chờ xác nhận'"

3. **User hủy đơn của người khác**
   - ❌ Thất bại với message: "Bạn không có quyền xóa đơn hàng này"

4. **Admin hủy bất kỳ đơn nào**
   - ✅ Thành công

## Files Changed

### Frontend:
- `frontend/src/pages/ProfileUserPage.jsx`
  - Added `deletingId` state
  - Added `handleDeleteOrder` function
  - Added UI for delete button (conditional rendering)
  - Added CSS styles

### Backend:
- `backend/src/controllers/orderController.js`
  - Updated `remove` function with permission checks
  
- `backend/src/routes/orderRoutes.js`
  - Moved `DELETE /:id` route before admin routes
  - Removed `authorizeAdmin` from delete route
