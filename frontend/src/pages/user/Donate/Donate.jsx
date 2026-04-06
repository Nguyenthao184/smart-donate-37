import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiArrowLeft,
  FiCheck,
  FiUser,
  FiMessageSquare,
  FiDollarSign,
  FiCheckCircle,
  FiExternalLink,
} from "react-icons/fi";
import { RiSparklingLine, RiQrCodeLine, RiBankCardLine } from "react-icons/ri";
import bank from "../../../assets/user/bank.png"; 
import vnpay from "../../../assets/user/vnpay.jpg"; 
import qrPlaceholder from "../../../assets/user/qr.png"; 
import "./Donate.scss";

/* ─── Constants ─── */
const PRESET_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000];

const BANK_INFO = {
  bankName: "Ngân hàng TMCP Quân Đội (MB Bank)",
  accountNumber: "2579",
  accountHolder: "Trung Tâm Hỗ Trợ Cứu Trợ Thiên Tai Việt",
};

const STEPS = [
  { id: 1, label: "Phương thức" },
  { id: 2, label: "Thông tin" },
  { id: 3, label: "Thanh toán" },
];

function formatVnd(n) {
  return Number(n).toLocaleString("vi-VN");
}

function generateTxCode(donor) {
  const suffix = donor
    ? donor
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase()
        .slice(0, 8)
    : "UOCMOCHOEM";
  return "UH3AV" + suffix;
}

/* ─── Component ─── */
export default function DonatePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [payMethod, setPayMethod] = useState("qr"); // "qr" | "vnpay"
  const [amount, setAmount] = useState(200000);
  const [customAmt, setCustomAmt] = useState("200.000");
  const [donor, setDonor] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const txCode = generateTxCode(donor);

  /* ── helpers ── */
  function selectPreset(val) {
    setAmount(val);
    setCustomAmt(val.toLocaleString("vi-VN"));
  }

  function handleCustomChange(e) {
    const raw = e.target.value.replace(/\D/g, "");
    setCustomAmt(raw ? Number(raw).toLocaleString("vi-VN") : "");
    setAmount(Number(raw) || 0);
  }

  function validateStep2() {
    const e = {};
    if (!amount || amount < 10000) e.amount = "Số tiền tối thiểu là 10.000 VNĐ";
    if (!donor.trim()) e.donor = "Vui lòng nhập tên người chuyển khoản";
    setErrors(e);
    return !Object.keys(e).length;
  }

  function next() {
    if (step === 1) {
      setErrors({});
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!validateStep2()) return;
      setErrors({});
      if (payMethod === "vnpay") {
        // Redirect to VNPay test page
        navigate("/payment/vnpay", {
          state: { amount, donor, message, txCode },
        });
        return;
      }
      setStep(3);
      return;
    }
    // step 3 QR: "Đã thanh toán" button
    navigate("/thanh-cong", {
      state: { amount, donor, message, method: "qr", txCode },
    });
  }

  function back() {
    setErrors({});
    setStep((s) => s - 1);
  }

  /* ─── Render ─── */
  return (
    <div className="dp-page">
      <div className="dp-card">
        {/* Hero */}
        <div className="dp-card__hero">
          <h1 className="dp-card__title">Quyên góp</h1>
          <p className="dp-card__sub">
            <RiSparklingLine size={13} /> Mỗi đóng góp đều tạo nên sự khác biệt
          </p>
        </div>

        {/* Stepper */}
        <div className="dp-stepper">
          {STEPS.map((s, i) => (
            <div key={s.id} className="dp-stepper__item">
              {i > 0 && (
                <div className={`dp-stepper__line${step > i ? " done" : ""}`} />
              )}
              <div
                className={`dp-stepper__dot${step === s.id ? " active" : ""}${step > s.id ? " done" : ""}`}
              >
                {step > s.id ? <FiCheck size={13} /> : s.id}
              </div>
              <span className={`dp-stepper__label${step === s.id ? " active" : ""}`}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`dp-stepper__line${step > s.id ? " done" : ""}`} />
              )}
            </div>
          ))}
        </div>

        <div className="dp-body">
          {/* ── Step 1: Chọn phương thức ── */}
          {step === 1 && (
            <div className="dp-step dp-step--1">
              <div className="dp-section-label">Chọn phương thức thanh toán</div>

              <div className="dp-method-select">
                <button
                  className={`dp-method-card${payMethod === "qr" ? " active" : ""}`}
                  onClick={() => setPayMethod("qr")}
                >
                  <div className="dp-method-card__icon dp-method-card__icon--qr">
                    <img src={bank} />
                  </div>
                  <div className="dp-method-card__body">
                    <div className="dp-method-card__name">Chuyển khoản QR</div>
                    <div className="dp-method-card__desc">
                      Quét mã QR qua ứng dụng ngân hàng
                    </div>
                  </div>
                  <div className={`dp-method-card__radio${payMethod === "qr" ? " checked" : ""}`}>
                    {payMethod === "qr" && <div className="dp-method-card__radio-dot" />}
                  </div>
                </button>

                <button
                  className={`dp-method-card${payMethod === "vnpay" ? " active" : ""}`}
                  onClick={() => setPayMethod("vnpay")}
                >
                  <div className="dp-method-card__icon dp-method-card__icon--vnpay">
                    <img src={vnpay} />
                  </div>
                  <div className="dp-method-card__body">
                    <div className="dp-method-card__name">VNPay</div>
                    <div className="dp-method-card__desc">
                      Thanh toán qua cổng VNPay / thẻ nội địa
                    </div>
                  </div>
                  <div className={`dp-method-card__radio${payMethod === "vnpay" ? " checked" : ""}`}>
                    {payMethod === "vnpay" && <div className="dp-method-card__radio-dot" />}
                  </div>
                </button>
              </div>

              <div className={`dp-method-badge${payMethod === "vnpay" ? " vnpay" : ""}`}>
                {payMethod === "qr" ? (
                  <>
                    <RiQrCodeLine size={14} />
                    Bạn sẽ quét QR ngân hàng ở bước cuối
                  </>
                ) : (
                  <>
                    <FiExternalLink size={14} />
                    Bạn sẽ được chuyển đến trang VNPay để thanh toán
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── Step 2: Nhập thông tin ── */}
          {step === 2 && (
            <div className="dp-step dp-step--2">
              <div className="dp-section-label">Thông tin chuyển khoản</div>

              {/* Presets */}
              <div className="dp-presets">
                {PRESET_AMOUNTS.map((v) => (
                  <button
                    key={v}
                    className={`dp-preset${amount === v ? " active" : ""}`}
                    onClick={() => selectPreset(v)}
                  >
                    {formatVnd(v)}đ
                  </button>
                ))}
              </div>

              {/* Amount input */}
              <div className="dp-field">
                <label className="dp-field__label">Số tiền quyên góp</label>
                <div className="dp-field__wrap">
                  <FiDollarSign size={16} className="dp-field__icon" />
                  <input
                    className={`dp-field__input${errors.amount ? " error" : ""}`}
                    value={customAmt}
                    onChange={handleCustomChange}
                    placeholder="Nhập số tiền..."
                  />
                  <span className="dp-field__suffix">VNĐ</span>
                </div>
                {errors.amount && (
                  <span className="dp-field__error">{errors.amount}</span>
                )}
              </div>

              {/* Donor name */}
              <div className="dp-field">
                <label className="dp-field__label">Tên người chuyển khoản</label>
                <div className="dp-field__wrap">
                  <FiUser size={16} className="dp-field__icon" />
                  <input
                    className={`dp-field__input${errors.donor ? " error" : ""}`}
                    placeholder="Nguyễn Văn A"
                    value={donor}
                    onChange={(e) => setDonor(e.target.value)}
                  />
                </div>
                {errors.donor && (
                  <span className="dp-field__error">{errors.donor}</span>
                )}
              </div>

              {/* Message */}
              <div className="dp-field">
                <label className="dp-field__label">
                  Nội dung chuyển khoản{" "}
                  <span className="dp-field__optional">(nhập mã đã lấy trong chiến dịch)</span>
                </label>
                <div className="dp-field__wrap">
                  <FiMessageSquare size={16} className="dp-field__icon" />
                  <input
                    className="dp-field__input"
                    placeholder="Lời nhắn hoặc để trống dùng mã tự động"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                {!message && donor && (
                  <span className="dp-field__hint">
                    Mã tự động: <strong>{txCode}</strong>
                  </span>
                )}
              </div>

              {/* Preview */}
              {amount >= 10000 && (
                <div className="dp-amount-preview">
                  <span>Bạn sẽ quyên góp</span>
                  <strong>{formatVnd(amount)} VNĐ</strong>
                </div>
              )}
            </div>
          )}

          {/* ── Step 3: QR ── */}
          {step === 3 && payMethod === "qr" && (
            <div className="dp-step dp-step--3">
              <div className="dp-confirm-header">
                <h3 className="dp-confirm-header__title">Quét mã để thanh toán</h3>
                <p className="dp-confirm-header__sub">
                  Sử dụng ứng dụng ngân hàng MB Bank hoặc ứng dụng hỗ trợ VietQR
                </p>
              </div>

              <div className="dp-qr-layout">
                {/* QR */}
                <div className="dp-qr-box">
                  <img src={qrPlaceholder} alt="QR Code" className="dp-qr-box__img" />
                  <div className="dp-qr-box__badges">
                    <span className="dp-badge dp-badge--vietqr">VIETQR</span>
                    <span className="dp-badge dp-badge--napas">napas+</span>
                  </div>
                </div>

                {/* Bank info */}
                <div className="dp-bank-info">
                  <div className="dp-bank-row">
                    <span className="dp-bank-row__label">Ngân hàng</span>
                    <span className="dp-bank-row__value">{BANK_INFO.bankName}</span>
                  </div>
                  <div className="dp-bank-row">
                    <span className="dp-bank-row__label">Số tài khoản</span>
                    <span className="dp-bank-row__value dp-bank-row__value--accent">
                      {BANK_INFO.accountNumber}
                    </span>
                  </div>
                  <div className="dp-bank-row">
                    <span className="dp-bank-row__label">Chủ tài khoản</span>
                    <span className="dp-bank-row__value dp-bank-row__value--name">
                      {BANK_INFO.accountHolder}
                    </span>
                  </div>
                  <div className="dp-bank-row">
                    <span className="dp-bank-row__label">Số tiền</span>
                    <span className="dp-bank-row__value dp-bank-row__value--amount">
                      {formatVnd(amount)} VNĐ
                    </span>
                  </div>
                  <div className="dp-bank-row dp-bank-row--transfer">
                    <span className="dp-bank-row__label">Nội dung CK</span>
                    <span className="dp-bank-row__value">
                      <span className="dp-tx-code">{message || txCode}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="dp-actions">
          <button className="dp-btn dp-btn--primary" onClick={next}>
            {step === 3 ? (
              <>
                <FiCheckCircle size={16} /> Đã thanh toán
              </>
            ) : step === 2 && payMethod === "vnpay" ? (
              <>
                Chuyển đến VNPay <FiExternalLink size={16} />
              </>
            ) : (
              <>
                Tiếp tục <FiArrowRight size={16} />
              </>
            )}
          </button>
          {step > 1 && (
            <button className="dp-btn dp-btn--ghost" onClick={back}>
              <FiArrowLeft size={14} /> Quay lại
            </button>
          )}
        </div>
      </div>
    </div>
  );
}