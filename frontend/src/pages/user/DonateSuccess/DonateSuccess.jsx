import { useLocation, useNavigate } from "react-router-dom";
import { FiHome, FiDownload, FiShare2 } from "react-icons/fi";
import { GiHeartWings } from "react-icons/gi";
import { RiSparklingLine } from "react-icons/ri";
import "./DonateSuccess.scss";

function formatVnd(n) {
  return Number(n).toLocaleString("vi-VN");
}

function formatDate() {
  const now = new Date();
  return `${now.getDate().toString().padStart(2,"0")}/${(now.getMonth()+1).toString().padStart(2,"0")}/${now.getFullYear()} - ${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`;
}

const METHOD_NAMES = {
  bank: "Chuyển khoản ngân hàng",
  vnpay: "VNPay",
};

export default function DonateSuccess() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const state     = location.state || {};
  const amount    = state.amount  || 200000;
  const donor     = state.donor   || "Nguyễn Văn A";
  const method    = state.method  || "momo";
  const txId      = state.txId    || "#DN-2026031984";
  const dateStr   = formatDate();

  const rows = [
    { label:"Người quyên góp", value: donor },
    { label:"Phương thức",      value: METHOD_NAMES[method] || method, isMomo: method==="momo" },
    { label:"Mã giao dịch",     value: txId },
    { label:"Thời gian",        value: dateStr },
  ];

  return (
    <div className="ds-page">
      <div className="ds-card">

        <div className="ds-hero">
          <h1 className="ds-hero__title">
            Quyên góp thành công!
            <RiSparklingLine size={20} className="ds-hero__spark"/>
          </h1>
          <p className="ds-hero__sub">Cảm ơn bạn đã đóng góp cho cộng đồng 💚</p>
        </div>

        {/* Amount */}
        <div className="ds-amount">
          <span className="ds-amount__val">{formatVnd(amount)} VNĐ</span>
          <div className="ds-amount__shimmer"/>
        </div>

        {/* Info table */}
        <div className="ds-info-box">
          {rows.map((r,i) => (
            <div key={i} className="ds-info-row">
              <span className="ds-info-row__label">{r.label}</span>
              <span className="ds-info-row__value">
                {r.isMomo ? (
                  <span className="ds-momo-tag">
                    <span className="ds-momo-tag__icon">mo<br/>mo</span>
                    MoMo
                  </span>
                ) : r.value}
              </span>
            </div>
          ))}
        </div>

        {/* Thank you message */}
        <div className="ds-thank">
          <div className="ds-thank__icon"><GiHeartWings size={40}/></div>
          <p className="ds-thank__text">
            Mỗi đóng góp của bạn đều tạo nên sự thay đổi tích cực cho cộng đồng.
            SmartDonate ghi nhận và trân trọng tấm lòng của bạn.
          </p>
        </div>

        {/* Actions */}
        <div className="ds-actions">
          <button className="ds-btn ds-btn--outline" onClick={() => navigate("/chien-dich")}>
            <FiHome size={15}/> Về trang chủ
          </button>
          <button className="ds-btn ds-btn--primary">
            <FiDownload size={15}/> Lưu biên lai
          </button>
        </div>

        <button className="ds-share">
          <FiShare2 size={14}/> Chia sẻ để lan tỏa yêu thương
        </button>

      </div>
    </div>
  );
}