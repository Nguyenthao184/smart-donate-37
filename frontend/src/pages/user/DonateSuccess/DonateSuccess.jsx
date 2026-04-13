import { useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FiShare2, FiHome, FiCheckCircle } from "react-icons/fi";
import useCampaignStore from "../../../store/campaignStore";
import "./DonateSuccess.scss";

function formatVnd(n) {
  return Number(n || 0).toLocaleString("vi-VN");
}

function formatDate(str) {
  if (str) return str;
  const now = new Date();
  return `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear()} - ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
}

const METHOD_LABELS = {
  qr: "Mã QR ngân hàng",
  vnpay: "VNPay",
};

export default function DonateSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const state = location.state || {};

  // QR → location.state | VNPay → query params
  const amount = state.amount || Number(searchParams.get("amount")) || 0;
  const donor = state.donor || searchParams.get("donor") || "Ẩn danh";
  const method = state.method || searchParams.get("method") || "qr";
  const txId = state.txId || searchParams.get("txId") || "—";
  const campaignId = state.campaignId || searchParams.get("campaignId");
  const campaignName =
    state.campaignName || searchParams.get("campaignName") || "—";
  const orgName = state.orgName || searchParams.get("orgName") || "—";
  const thoiGian = state.thoiGian || searchParams.get("thoiGian");
  const status = searchParams.get("status");

  // Invalidate cache sau khi donate thành công
  useEffect(() => {
    if (campaignId) {
      useCampaignStore.getState().invalidateCampaignDetail(campaignId);
      useCampaignStore.getState().refreshCampaignData();
    }
  }, []);

  if (status === "failed") {
    return (
      <div className="ds-page">
        <div className="ds-card">
          <div className="ds-header ds-header--failed">
            <div className="ds-header__icon-wrap">
              <div className="ds-header__icon-circle ds-header__icon-circle--failed">
                <FiX size={24} />
              </div>
            </div>
            <div className="ds-header__title">Thanh toán thất bại</div>
            <div className="ds-header__sub">
              Giao dịch không thành công hoặc đã bị huỷ
            </div>
          </div>
          <div className="ds-actions" style={{ padding: "24px" }}>
            <button
              className="ds-btn ds-btn--outline"
              onClick={() => navigate("/chien-dich")}
            >
              <FiHome size={15} /> Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ds-page">
      <div className="ds-card">
        {/* Header */}
        <div className="ds-header">
          <div className="ds-header__icon-wrap">
            <div className="ds-header__ring" />
            <div className="ds-header__ring ds-header__ring--2" />
            <div className="ds-header__icon-circle">
              <FiCheckCircle size={26} />
            </div>
          </div>
          <div className="ds-header__title">Quyên góp thành công</div>
          <div className="ds-header__sub">
            Cảm ơn bạn đã chung tay với cộng đồng
          </div>
        </div>

        {/* Amount */}
        <div className="ds-amount">
          <div className="ds-amount__label">Số tiền đã quyên góp</div>
          <div className="ds-amount__val">
            {formatVnd(amount)}
            <span className="ds-amount__unit">VNĐ</span>
          </div>
          <div className="ds-amount__shimmer" />
        </div>

        <div className="ds-dashed" />

        {/* Thông tin chiến dịch */}
        <div className="ds-section">
          <div className="ds-section__label">Thông tin chiến dịch</div>
          <div className="ds-row">
            <span className="ds-row__key">Chiến dịch</span>
            <span className="ds-row__val">{campaignName}</span>
          </div>
          <div className="ds-row">
            <span className="ds-row__key">Tổ chức</span>
            <span className="ds-row__val">{orgName}</span>
          </div>
          <div className="ds-row">
            <span className="ds-row__key">Trạng thái</span>
            <span className="ds-row__val">
              <span className="ds-badge ds-badge--success">Đã xác nhận</span>
            </span>
          </div>
        </div>

        <div className="ds-dashed" />

        {/* Thông tin giao dịch */}
        <div className="ds-section">
          <div className="ds-section__label">Thông tin giao dịch</div>
          <div className="ds-row">
            <span className="ds-row__key">Người quyên góp</span>
            <span className="ds-row__val">{donor}</span>
          </div>
          <div className="ds-row">
            <span className="ds-row__key">Phương thức</span>
            <span className="ds-row__val">
              <span className="ds-badge ds-badge--info">
                {METHOD_LABELS[method]}
              </span>
            </span>
          </div>
          <div className="ds-row">
            <span className="ds-row__key">Mã giao dịch</span>
            <span className="ds-row__val ds-row__val--mono">{txId}</span>
          </div>
          <div className="ds-row">
            <span className="ds-row__key">Thời gian</span>
            <span className="ds-row__val">{formatDate(thoiGian)}</span>
          </div>
        </div>

        <div className="ds-dashed" />

        {/* Thank you */}
        <div className="ds-thank">
          <p className="ds-thank__quote">
            "Mỗi đồng bạn góp hôm nay có thể là bữa cơm ấm, là quyển sách mới,
            là nụ cười của một đứa trẻ ở nơi xa. SmartDonate trân trọng tấm lòng
            của bạn."
          </p>
          <p className="ds-thank__name">— Đội ngũ SmartDonate</p>
        </div>

        {/* Actions */}
        <div className="ds-actions">
          <button
            className="ds-btn ds-btn--outline"
            onClick={() =>
              navigate("/chien-dich", { state: { refresh: true } })
            }
          >
            <FiHome size={15} /> Về trang chủ
          </button>
          <button className="ds-btn ds-btn--primary">
            <FiShare2 size={15} /> Chia sẻ
          </button>
        </div>

        <button className="ds-share-sub">
          <FiShare2 size={13} /> Lan tỏa để thêm nhiều người cùng góp tay
        </button>
      </div>
    </div>
  );
}
