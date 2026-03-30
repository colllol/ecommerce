import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../shared/CartContext';

export default function CartPage() {
  const { items, totals, updateQuantity, removeFromCart, clearCart, calcLineTotal } = useCart();

  return (
    <div>
      <h2>Giỏ hàng</h2>
      {items.length === 0 && <p>Chưa có sản phẩm trong giỏ.</p>}
      {items.length > 0 && (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Số lượng</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.product_id}>
                  <td>{i.product_name}</td>
                  <td style={{ width: 140 }}>
                    <input
                      type="number"
                      min={1}
                      value={i.quantity}
                      onChange={(e) => updateQuantity(i.product_id, e.target.value)}
                    />
                  </td>
                  <td>{Number(i.price).toLocaleString()} đ</td>
                  <td>{Number(calcLineTotal(i)).toLocaleString()} đ</td>
                  <td style={{ width: 120 }}>
                    <button onClick={() => removeFromCart(i.product_id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="cart-summary">
            <div>
              <div>Số lượng: {totals.count}</div>
              <div>
                Tổng: <b>{Number(totals.subtotal).toLocaleString()} đ</b>
              </div>
            </div>
            <div className="actions">
              <button onClick={clearCart}>Xóa tất cả</button>
              <Link to="/checkout" className="btn-primary">
                Đặt hàng
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

