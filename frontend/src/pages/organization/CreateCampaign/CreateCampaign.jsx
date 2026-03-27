import { useState, useRef } from "react";
import { Button, Input, Select, DatePicker } from "antd";
import {
  FiChevronRight,
  FiChevronLeft,
  FiCheck,
  FiImage,
  FiUpload,
  FiX,
  FiInfo,
  FiCalendar,
  FiMapPin,
  FiDollarSign,
} from "react-icons/fi";
import { GiKnifeFork } from "react-icons/gi";
import { FaChildren, FaEarthEurope, FaPooStorm } from "react-icons/fa6";
import { RiHandCoinLine } from "react-icons/ri";
import { MdCastForEducation } from "react-icons/md";
import "./CreateCampaign.scss";

const { TextArea } = Input;
const { Option } = Select;

const CATEGORIES = [
  {
    value: "thien-tai",
    label: "Thiên tai",
    icon: <FaPooStorm />,
    color: "#FD4848",
  },
  {
    value: "xoa-doi",
    label: "Xóa đói",
    icon: <GiKnifeFork />,
    color: "#FDBE48",
  },
  {
    value: "an-sinh",
    label: "An sinh",
    icon: <RiHandCoinLine />,
    color: "#D9FD48",
  },
  { value: "tre-em", label: "Trẻ em", icon: <FaChildren />, color: "#48FDE8" },
  {
    value: "moi-truong",
    label: "Môi trường",
    icon: <FaEarthEurope />,
    color: "#5AFD48",
  },
  {
    value: "giao-duc",
    label: "Giáo dục",
    icon: <MdCastForEducation />,
    color: "#FF9FE7",
  },
];

const STEPS = [
  { id: 1, label: "Thông tin" },
  { id: 2, label: "Mục tiêu" },
];

export default function CreateCampaign() {
  const [step, setStep] = useState(1);
  const [images, setImages] = useState([]);
  const [previewImg, setPreviewImg] = useState(null);
  const fileRef = useRef(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    goal: "",
    endDate: null,
    location: "",
  });

  function handleFile(e) {
    const files = Array.from(e.target.files);
    const newImgs = files.map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
      name: f.name,
    }));
    setImages((prev) => [...prev, ...newImgs]);
    if (!previewImg && newImgs.length) setPreviewImg(newImgs[0].url);
  }

  function removeImage(idx) {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (previewImg === prev[idx].url) {
        setPreviewImg(next[0]?.url ?? null);
      }
      return next;
    });
  }

  function handleNext() {
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleBack() {
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="cc-page">
      {/* ── Page title ── */}
      <div className="cc-page__header">
        <div className="cc-page__title-wrap">
          <span className="cc-page__title">Tạo Chiến Dịch Từ Thiện</span>
          <span className="cc-page__title-icon">✨</span>
        </div>
        <p className="cc-page__subtitle">
          Chia sẻ yêu thương — Lan tỏa giá trị nhân văn đến cộng đồng
        </p>
      </div>

      <div className="cc-stepper">
        <div className="cc-stepper__edge" />
        {STEPS.map((s, i) => (
          <div key={s.id} className="cc-stepper__item">
            {i > 0 && (
              <div className={`cc-stepper__line${step > i ? " done" : ""}`} />
            )}
            <div
              className={`cc-stepper__dot${step === s.id ? " active" : ""}${step > s.id ? " done" : ""}`}
            >
              {step > s.id ? <FiCheck size={14} /> : s.id}
            </div>
            <span
              className={`cc-stepper__label${step === s.id ? " active" : ""}`}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={`cc-stepper__line${step > s.id ? " done" : ""}`}
              />
            )}
          </div>
        ))}
        <div className="cc-stepper__edge" />
      </div>

      {/* ── Form card ── */}
      <div className="cc-card">
        <div className="cc-card__step-header">
          <span className="cc-card__step-num">Step {step}:</span>
          <span className="cc-card__step-title">
            {step === 1 ? "Thông tin chiến dịch" : "Mục tiêu chiến dịch"}
          </span>
        </div>
        <div className="cc-card__step-desc">
          {step === 1
            ? "Nhập thông tin cơ bản cho chiến dịch từ thiện của bạn"
            : "Đặt mục tiêu quyên góp và thời gian kết thúc cho chiến dịch"}
        </div>
        <div className="cc-card__divider" />

        {/* ── Step 1 ── */}
        {step === 1 && (
          <div className="cc-form cc-form--step1">
            <div className="cc-field">
              <label className="cc-field__label">
                Tên chiến dịch
                <span className="cc-field__required">*</span>
              </label>
              <Input
                className="cc-field__input"
                placeholder="Nhập tên chiến dịch..."
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                prefix={<FiInfo size={15} className="cc-field__prefix-icon" />}
              />
            </div>

            <div className="cc-field">
              <label className="cc-field__label">
                Danh mục
                <span className="cc-field__required">*</span>
              </label>
              <Select
                className="cc-field__select"
                placeholder="Chọn danh mục"
                value={form.category || undefined}
                onChange={(v) => setForm((p) => ({ ...p, category: v }))}
              >
                {CATEGORIES.map((c) => (
                  <Option key={c.value} value={c.value}>
                    <span className="cc-select-option">
                      <span
                        className="cc-select-option__icon"
                        style={{ background: c.color }}
                      >
                        {c.icon}
                      </span>
                      {c.label}
                    </span>
                  </Option>
                ))}
              </Select>
            </div>

            <div className="cc-field">
              <label className="cc-field__label">Mô tả</label>
              <TextArea
                className="cc-field__textarea"
                placeholder="Mô tả chiến dịch..."
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                showCount
                maxLength={500}
              />
            </div>

            <div className="cc-field">
              <label className="cc-field__label">Upload hình ảnh</label>

              {previewImg && (
                <div className="cc-upload__preview">
                  <img src={previewImg} alt="preview" />
                  <div className="cc-upload__preview-thumbs">
                    {images.map((img, i) => (
                      <div
                        key={i}
                        className={`cc-upload__thumb${previewImg === img.url ? " active" : ""}`}
                        onClick={() => setPreviewImg(img.url)}
                      >
                        <img src={img.url} alt={img.name} />
                        <button
                          className="cc-upload__thumb-remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(i);
                          }}
                        >
                          <FiX size={30} />
                        </button>
                      </div>
                    ))}
                    <div
                      className="cc-upload__thumb cc-upload__thumb--add"
                      onClick={() => fileRef.current?.click()}
                    >
                      <FiUpload size={16} />
                    </div>
                  </div>
                </div>
              )}

              {!previewImg && (
                <div
                  className="cc-upload__zone"
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add("dragging");
                  }}
                  onDragLeave={(e) =>
                    e.currentTarget.classList.remove("dragging")
                  }
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove("dragging");
                    const files = Array.from(e.dataTransfer.files);
                    const newImgs = files.map((f) => ({
                      file: f,
                      url: URL.createObjectURL(f),
                      name: f.name,
                    }));
                    setImages((prev) => [...prev, ...newImgs]);
                    if (newImgs.length) setPreviewImg(newImgs[0].url);
                  }}
                >
                  <div className="cc-upload__zone-icon">
                    <FiImage size={32} />
                  </div>
                  <div className="cc-upload__zone-text">Tải ảnh lên</div>
                  <div className="cc-upload__zone-hint">
                    Kéo thả hoặc click để chọn ảnh
                  </div>
                </div>
              )}

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={handleFile}
              />
            </div>

            <div className="cc-form__actions cc-form__actions--right">
              <Button
                type="primary"
                size="large"
                className="cc-btn cc-btn--next"
                onClick={handleNext}
              >
                Tiếp theo <FiChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <div className="cc-form cc-form--step2">
            <div className="cc-field">
              <label className="cc-field__label">
                Mục tiêu cần đạt
                <span className="cc-field__required">*</span>
              </label>
              <Input
                className="cc-field__input"
                placeholder="Nhập số tiền cần đạt..."
                value={form.goal}
                onChange={(e) =>
                  setForm((p) => ({ ...p, goal: e.target.value }))
                }
                prefix={
                  <FiDollarSign size={15} className="cc-field__prefix-icon" />
                }
                suffix={<span className="cc-field__suffix">VNĐ</span>}
              />
              {form.goal && (
                <div className="cc-field__hint">
                  ≈{" "}
                  {Number(form.goal.replace(/\D/g, "")).toLocaleString("vi-VN")}{" "}
                  đồng
                </div>
              )}
            </div>

            <div className="cc-field">
              <label className="cc-field__label">
                Thời gian kết thúc
                <span className="cc-field__required">*</span>
              </label>
              <DatePicker
                className="cc-field__datepicker"
                placeholder="Chọn thời gian"
                format="DD/MM/YYYY"
                suffixIcon={<FiCalendar size={15} />}
                onChange={(v) => setForm((p) => ({ ...p, endDate: v }))}
              />
            </div>

            <div className="cc-field">
              <label className="cc-field__label">Vị trí chiến dịch</label>
              <Input
                className="cc-field__input"
                placeholder="Nhập địa điểm..."
                value={form.location}
                onChange={(e) =>
                  setForm((p) => ({ ...p, location: e.target.value }))
                }
                prefix={
                  <FiMapPin size={15} className="cc-field__prefix-icon" />
                }
              />

              <div className="cc-map">
                <iframe
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(form.location || "Da Nang")}&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="map"
                />
              </div>
            </div>

            <div className="cc-form__actions cc-form__actions--split">
              <Button
                size="large"
                className="cc-btn cc-btn--back"
                onClick={handleBack}
              >
                <FiChevronLeft size={16} /> Quay lại
              </Button>
              <Button
                type="primary"
                size="large"
                className="cc-btn cc-btn--finish"
              >
                Hoàn tất <FiChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
