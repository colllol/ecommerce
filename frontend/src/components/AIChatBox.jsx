import React, { useState, useRef, useEffect } from 'react';
import api from '../config/api';

// Mock AI responses - có thể thay bằng API thật (OpenAI, etc.)
const getAIResponse = (message, products = [], categories = []) => {
  const text = (message || '').toLowerCase().trim();
  if (!text) return 'Xin chào! Tôi có thể giúp bạn tìm sản phẩm, danh mục, hướng dẫn đặt hàng, vận chuyển, đổi trả hoặc liên hệ. Bạn cần gì?';

  // Chào hỏi
  if (/xin chào|hello|chào|hi|alo|helo/.test(text) && text.length < 20) {
    return 'Xin chào! Tôi là trợ lý AI của Ecommerce. Tôi có thể giúp bạn:\n• Tìm sản phẩm & danh mục\n• Hướng dẫn đặt hàng, thanh toán\n• Thông tin vận chuyển, đổi trả\n• Liên hệ hỗ trợ\nBạn cần hỗ trợ gì?';
  }

  // Giá cả
  if (/giá|price|bao nhiêu|phí|chi phí|tốn|cost|worth/.test(text)) {
    if (products.length > 0) {
      const samples = products.slice(0, 2).map((p) => `${p.product_name}: ${Number(p.price || 0).toLocaleString('vi-VN')}₫`).join('\n• ');
      return `Bạn có thể xem giá trên trang chi tiết từng sản phẩm. Ví dụ:\n• ${samples}\nDùng ô tìm kiếm trên trang chủ hoặc danh mục để lọc theo giá.`;
    }
    return 'Bạn có thể xem giá từng sản phẩm trên trang chi tiết. Vào Trang chủ → chọn sản phẩm → xem giá. Chúng tôi cũng hỗ trợ lọc theo khoảng giá.';
  }

  // Đặt hàng, mua hàng, checkout
  if (/đặt hàng|mua|checkout|thanh toán|mua hàng|order|purchase/.test(text)) {
    return 'Các bước đặt hàng:\n1) Thêm sản phẩm vào giỏ (nút "Thêm vào giỏ")\n2) Vào trang Giỏ hàng\n3) Nhập thông tin giao hàng\n4) Chọn phương thức thanh toán (COD hoặc chuyển khoản)\n5) Xác nhận đơn hàng\nMọi thắc mắc hãy hỏi tôi!';
  }

  // Thanh toán chi tiết
  if (/thanh toán|payment|trả tiền|cod|chuyển khoản|thẻ|visa|momo/.test(text)) {
    return 'Chúng tôi hỗ trợ:\n• COD (thanh toán khi nhận hàng)\n• Chuyển khoản ngân hàng\n• Ví điện tử (Momo, ZaloPay... - tùy cấu hình)\nBạn chọn phương thức khi thanh toán đơn hàng.';
  }

  // Liên hệ
  if (/liên hệ|hotline|sđt|phone|support|email|địa chỉ|call|gọi/.test(text)) {
    return 'Liên hệ hỗ trợ:\n• Email: support@ecommerce.vn\n• Hotline: 1900 xxxx\n• Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM\nChúng tôi phản hồi trong 24h. Xem thêm thông tin trong footer.';
  }

  // Vận chuyển
  if (/vận chuyển|giao hàng|ship|shipping|bao lâu|khi nào nhận|delivery/.test(text)) {
    return 'Vận chuyển:\n• Nội thành: 1–2 ngày\n• Ngoại thành: 2–5 ngày\n• Miễn phí đơn từ 500.000₫ (hoặc theo chính sách hiện tại)\nBạn có thể theo dõi đơn hàng qua email/sms sau khi đặt.';
  }

  // Đổi trả
  if (/đổi trả|hoàn tiền|refund|bảo hành|bảo hành|hư hỏng|lỗi/.test(text)) {
    return 'Chính sách đổi trả:\n• Đổi trả trong 7 ngày nếu sản phẩm lỗi, sai mô tả\n• Giữ nguyên tem, hộp\n• Liên hệ hotline/email để được hướng dẫn\n• Bảo hành theo chính sách từng sản phẩm';
  }

  // Sản phẩm, tìm kiếm
  if (/sản phẩm|product|tìm|search|gợi ý|mua gì|nên mua/.test(text)) {
    if (products.length > 0) {
      const names = products.slice(0, 4).map((p) => p.product_name).join(', ');
      return `Gợi ý sản phẩm: ${names}.\nBạn có thể tìm kiếm hoặc lọc theo danh mục, giá trên trang chủ.`;
    }
    return 'Dùng ô tìm kiếm trên trang chủ và danh mục để tìm sản phẩm. Cho tôi biết thể loại bạn thích, tôi có thể gợi ý thêm.';
  }

  // Danh mục
  if (/danh mục|category|loại|phân loại|mặt hàng/.test(text)) {
    if (categories.length > 0) {
      const names = categories.map((c) => c.category_name).join(', ');
      return `Các danh mục: ${names}. Vào Trang chủ hoặc nhấn từng danh mục để xem sản phẩm.`;
    }
    return 'Vào Trang chủ để xem danh mục sản phẩm. Bạn có thể lọc theo danh mục khi tìm kiếm.';
  }

  // Giỏ hàng
  if (/giỏ hàng|cart|thêm giỏ|xóa giỏ/.test(text)) {
    return 'Giỏ hàng dùng để lưu sản phẩm trước khi thanh toán. Bạn thêm sản phẩm từ trang chi tiết, sau đó vào Giỏ hàng (link trên header) để xem và tiến hành thanh toán.';
  }

  // Tạm biệt
  if (/cảm ơn|thanks|thank|cảm ơn bạn|bye|tạm biệt|hẹn gặp/.test(text)) {
    return 'Rất vui được hỗ trợ bạn! Chúc bạn mua sắm vui vẻ. Hẹn gặp lại!';
  }

  // Giờ làm việc
  if (/giờ làm|mở cửa|open|làm việc|khi nào|thời gian/.test(text)) {
    return 'Hỗ trợ trực tuyến 24/7. Hotline và email phản hồi trong giờ hành chính (8h–22h). Chatbot luôn sẵn sàng trả lời.';
  }

  // Trợ giúp chung
  if (/trợ giúp|help|hướng dẫn|hỗ trợ|làm sao|như thế nào/.test(text)) {
    return 'Tôi có thể trả lời về:\n• Sản phẩm, danh mục\n• Đặt hàng, thanh toán\n• Vận chuyển, đổi trả\n• Liên hệ, giờ làm việc\nBạn muốn hỏi gì cụ thể?';
  }

  return 'Tôi chưa hiểu rõ câu hỏi. Bạn có thể hỏi về: sản phẩm, giá cả, đặt hàng, thanh toán, vận chuyển, đổi trả hoặc liên hệ. Hãy thử diễn đạt lại nhé!';
};

export default function AIChatBox() {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (open) {
      Promise.all([
        api.get('/api/products').then((res) => setProducts(res.data || [])),
        api.get('/api/categories').then((res) => setCategories(res.data || [])),
      ]).catch(() => {});
    }
  }, [open]);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Xin chào! Tôi là trợ lý AI. Bạn cần hỗ trợ gì?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    // Giả lập delay phản hồi
    setTimeout(() => {
      const reply = getAIResponse(text, products, categories);
      setMessages((prev) => [...prev, { role: 'ai', text: reply }]);
      setLoading(false);
    }, 500);
  };

  return (
    <>
      <button
        type="button"
        className="ai-chat-toggle"
        onClick={() => setOpen(!open)}
        aria-label="Mở chat AI"
        title="Chat trợ lý AI"
      >
        {open ? '✕' : '💬'}
      </button>

      {open && (
        <div className="ai-chat-box">
          <div className="ai-chat-header">
            <span>Trợ lý AI</span>
            <button type="button" className="ai-chat-close" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="ai-chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`ai-msg ai-msg-${m.role}`}>
                {m.text}
              </div>
            ))}
            {loading && <div className="ai-msg ai-msg-ai ai-msg-typing">Đang suy nghĩ...</div>}
            <div ref={bottomRef} />
          </div>
          <div className="ai-chat-input-wrap">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              disabled={loading}
            />
            <button type="button" className="btn btn-primary" onClick={sendMessage}>
              Gửi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
