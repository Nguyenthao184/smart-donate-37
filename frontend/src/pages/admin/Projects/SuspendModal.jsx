import { useState } from "react";
import { FiX, FiPause } from "react-icons/fi";

export default function SuspendModal({ target, type = "campaign", submitting, onSubmit, onClose }) {
  // type: 'campaign' | 'post'
  const [lyDo, setLyDo] = useState("");

  const labelType = type === "campaign" ? "chiến dịch" : "bài đăng";
  const canSubmit = lyDo.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit || submitting) return;
    onSubmit(lyDo.trim());
  };

  return (
    <div className="sus-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sus-modal">
        <div className="sus-modal__header">
          <div>
            <div className="sus-modal__title">
              <FiPause size={16} /> Tạm dừng {labelType}
            </div>
            <div className="sus-modal__sub">{target.ten}</div>
          </div>
          <button className="sus-modal__close" onClick={onClose}>
            <FiX size={18} />
          </button>
        </div>

        <div className="sus-modal__body">
          <div className="sus-section">
            <div className="sus-section__title">Lý do tạm dừng *</div>
            <textarea
              className="sus-textarea"
              placeholder="Nhập lý do tạm dừng..."
              value={lyDo}
              onChange={(e) => setLyDo(e.target.value)}
              rows={4}
              maxLength={255}
              autoFocus
            />
            <div className="sus-hint">
              Lý do sẽ được gửi đến chủ {labelType} qua thông báo realtime.
            </div>
          </div>
        </div>

        <div className="sus-modal__footer">
          <button className="sus-btn sus-btn--ghost" onClick={onClose} disabled={submitting}>
            Hủy
          </button>
          <button
            className="sus-btn sus-btn--warning"
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
          >
            <FiPause size={12} /> {submitting ? "Đang xử lý..." : "Xác nhận tạm dừng"}
          </button>
        </div>
      </div>
    </div>
  );
}