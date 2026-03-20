import CampaignCard from "../../../components/CampaignCard/index.jsx";
import OrganizationCard from "../../../components/OrganizationCard/index.jsx";
import Header from "../../../components/Header/index.jsx";
import Footer from "../../../components/Footer/index.jsx";
import banner1 from "../../../assets/user/banner1.jpg";
import chonhan from "../../../assets/user/chonhan.jpg";
import { FaPooStorm } from "react-icons/fa6";
import { GiKnifeFork } from "react-icons/gi";
import { RiHandCoinLine } from "react-icons/ri";
import { FaChildren, FaEarthEurope } from "react-icons/fa6";
import { MdCastForEducation } from "react-icons/md";
import { FiChevronRight, FiChevronLeft } from "react-icons/fi";
import { Button, Row, Col, Typography, Space, Card, Image } from "antd";
import { useRef } from "react";
import { Carousel } from "antd";
import img1 from "../../../assets/user/img1.png";
import img2 from "../../../assets/user/img2.png";
import img3 from "../../../assets/user/img3.png";
import img4 from "../../../assets/user/img4.png";
import "./Home.scss";

const { Title, Paragraph, Text } = Typography;

// ── Mock data ─────────────────────────────────────────────────────────
const MOCK_CAMPAIGNS = [
  {
    id: 1,
    title: "Giảm thiệt hại thiên tai miền Trung",
    daysLeft: 5,
    raised: 750000000,
    goal: 1000000000,
    image: null,
  },
  {
    id: 2,
    title: "Xây trường cho trẻ em vùng cao",
    daysLeft: 3,
    raised: 350000000,
    goal: 1000000000,
    image: null,
  },
  {
    id: 3,
    title: "Hội người khuyết tật Đà Nẵng",
    daysLeft: 4,
    raised: 750000000,
    goal: 1000000000,
    image: null,
  },
  {
    id: 4,
    title: "Quỹ bữa ăn cho trẻ em khó khăn",
    daysLeft: 6,
    raised: 120000000,
    goal: 300000000,
    image: null,
  },
  {
    id: 5,
    title: "Hỗ trợ người già neo đơn Hà Nội",
    daysLeft: 10,
    raised: 200000000,
    goal: 500000000,
    image: null,
  },
  {
    id: 6,
    title: "Trồng rừng phòng hộ miền Bắc",
    daysLeft: 14,
    raised: 80000000,
    goal: 400000000,
    image: null,
  },
];

const MOCK_ORGANIZATIONS = [
  {
    id: 1,
    name: "HỘI CHỮ THẬP ĐỎ VIỆT NAM",
    accountNumber: 1024,
    totalRaised: 1782452000,
    joinedAt: "03/2024",
    region: "Đà Nẵng",
    logo: null,
  },
  {
    id: 2,
    name: "MẶT TRẬN TỔ QUỐC VIỆT NAM",
    accountNumber: 2048,
    totalRaised: 3200000000,
    joinedAt: "01/2023",
    region: "Hà Nội",
    logo: null,
  },
  {
    id: 3,
    name: "THỊNH PHÁT GROUP",
    accountNumber: 3072,
    totalRaised: 980000000,
    joinedAt: "06/2023",
    region: "TP.HCM",
    logo: null,
  },
  {
    id: 4,
    name: "QUỸ TRẺ EM VIỆT NAM",
    accountNumber: 4096,
    totalRaised: 540000000,
    joinedAt: "11/2023",
    region: "Hà Nội",
    logo: null,
  },
  {
    id: 5,
    name: "QUỸ BẢO VỆ MÔI TRƯỜNG",
    accountNumber: 5120,
    totalRaised: 320000000,
    joinedAt: "02/2024",
    region: "Huế",
    logo: null,
  },
];

// ── Carousel wrapper dùng chung ───────────────────────────────────────
function CardCarousel({ children, className = "" }) {
  const ref = useRef(null);
  return (
    <div className={`home-carousel-wrap ${className}`}>
      <Carousel
        ref={ref}
        dots={false}
        infinite={false}
        draggable
        slidesToShow={3}
        responsive={[
          { breakpoint: 1200, settings: { slidesToShow: 2 } },
          { breakpoint: 640, settings: { slidesToShow: 1 } },
        ]}
      >
        {children}
      </Carousel>
      <button
        className="home-carousel__nav home-carousel__nav--prev"
        onClick={() => ref.current?.prev?.()}
        aria-label="Trước"
      >
        <FiChevronLeft size={18} />
      </button>
      <button
        className="home-carousel__nav home-carousel__nav--next"
        onClick={() => ref.current?.next?.()}
        aria-label="Sau"
      >
        <FiChevronRight size={18} />
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────
export default function HomePage() {
  const categories = [
    { id: 1, label: "Thiên tai", icon: <FaPooStorm />, color: "#FD4848" },
    { id: 2, label: "Giảm đói", icon: <GiKnifeFork />, color: "#FDBE48" },
    { id: 3, label: "Xóa nghèo", icon: <RiHandCoinLine />, color: "#D9FD48" },
    { id: 4, label: "Trẻ em", icon: <FaChildren />, color: "#48FDE8" },
    { id: 5, label: "Môi trường", icon: <FaEarthEurope />, color: "#5AFD48" },
    {
      id: 6,
      label: "Giáo dục",
      icon: <MdCastForEducation />,
      color: "#FF9FE7",
    },
  ];

  return (
    <div className="home-page">
      <Header />

      {/* 1. Hero Banner */}
      <section className="home-hero">
        <div className="home-hero__content">
          <img src={banner1} alt="Hero" className="home-hero__image-bg" />
          <div className="home-hero__overlay" />
          <div className="home-hero__text">
            <Typography>
              <Title level={1}>KẾT NỐI CỘNG ĐỒNG GÂY QUỸ & CHO NHẬN</Title>
              <Paragraph className="hero-desc">
                Khám phá và đóng góp cho các dự án ý nghĩa hoặc trao tặng và
                nhận quà từ cộng đồng
              </Paragraph>
              <Space size="middle" className="home-hero__btns">
                <Button type="primary" size="large" className="btn-hero-orange">
                  KHÁM PHÁ CHIẾN DỊCH
                </Button>
                <Button size="large" className="btn-hero-green">
                  ĐĂNG BÀI CHO/NHẬN
                </Button>
              </Space>
            </Typography>
          </div>
        </div>
      </section>

      {/* 2. Danh mục */}
      <section className="home-categories">
        <Row
          gutter={[16, 24]}
          justify="space-between"
          className="home-categories__inner"
        >
          {categories.map((cat) => (
            <Col key={cat.id} xs={12} sm={8} md={4}>
              <div className="category-item">
                <div
                  className="category-item__icon"
                  style={{ backgroundColor: cat.color }}
                >
                  {cat.icon}
                </div>
                <Text strong className="category-item__label">
                  {cat.label}
                </Text>
              </div>
            </Col>
          ))}
        </Row>
      </section>

      {/* 3. Chiến dịch nổi bật */}
      <section className="home-campaigns">
        <div className="home-section__header">
          <h2 className="home-section__title">CHIẾN DỊCH NỔI BẬT</h2>
          <a href="#" className="view-all">
            Xem tất cả <FiChevronRight />
          </a>
        </div>
        <CardCarousel>
          {MOCK_CAMPAIGNS.map((c, i) => (
            <div key={c.id} className="home-carousel__slide">
              <CampaignCard campaign={c} index={i} />
            </div>
          ))}
        </CardCarousel>
      </section>

      {/* 6. Banner cuối */}
      <section className="home-bottom-banner">
        <Carousel
          autoplay
          autoplaySpeed={2000}
          slidesToShow={2}
          slidesToScroll={1}
        >
          <div>
            <div className="bottom-banner-item">
              <img
                src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=2070&auto=format&fit=crop"
                alt="Banner 1"
              />
            </div>
          </div>
          <div>
            <div className="bottom-banner-item">
              <img
                src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=2070&auto=format&fit=crop"
                alt="Banner 2"
              />
            </div>
          </div>
          <div>
            <div className="bottom-banner-item">
              <img
                src="https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070&auto=format&fit=crop"
                alt="Banner 3"
              />
            </div>
          </div>
          <div>
            <div className="bottom-banner-item">
              <img
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop"
                alt="Banner 4"
              />
            </div>
          </div>
        </Carousel>
      </section>

      {/* 4. CTA */}
      <section className="home-cta">
        <div className="home-cta__inner">
          <Card className="cta-card cta-card--create" bordered={false}>
            <Title level={3}>Muốn tạo quỹ chiến dịch? Hãy bắt đầu ngay!</Title>
            <Row gutter={[12, 24]} className="cta-steps">
              <Col span={12}>
                <Space align="start" className="cta-step">
                  <div className="cta-step__icon">
                    <img src={img1} alt="Lên ý tưởng" />
                  </div>
                  <div>
                    <Text strong className="cta-step__title">
                      Lên ý tưởng
                    </Text>
                    <Paragraph type="secondary" className="cta-step__desc">
                      Xác định mục tiêu và ý tưởng cho dự án
                    </Paragraph>
                  </div>
                </Space>
              </Col>
              <Col span={12}>
                <Space align="start" className="cta-step">
                  <div className="cta-step__icon">
                    <img src={img3} alt="Tạo & Gọi Vốn" />
                  </div>
                  <div>
                    <Text strong className="cta-step__title">
                      Tạo & Gọi Vốn
                    </Text>
                    <Paragraph type="secondary" className="cta-step__desc">
                      Tạo hồ sơ tại website và kêu gọi ủng hộ
                    </Paragraph>
                  </div>
                </Space>
              </Col>
              <Col span={12}>
                <Space align="start" className="cta-step">
                  <div className="cta-step__icon">
                    <img src={img2} alt="Nhận đóng góp" />
                  </div>
                  <div>
                    <Text strong className="cta-step__title">
                      Nhận Đóng Góp
                    </Text>
                    <Paragraph type="secondary" className="cta-step__desc">
                      Tiếp nhận đóng góp để lan tỏa yêu thương
                    </Paragraph>
                  </div>
                </Space>
              </Col>
              <Col span={12}>
                <Space align="start" className="cta-step">
                  <div className="cta-step__icon">
                    <img src={img4} alt="Triển khai dự án" />
                  </div>
                  <div>
                    <Text strong className="cta-step__title">
                      Triển Khai Dự Án
                    </Text>
                    <Paragraph type="secondary" className="cta-step__desc">
                      Thực hiện dự án mang lại giá trị cộng đồng
                    </Paragraph>
                  </div>
                </Space>
              </Col>
            </Row>
          </Card>

          <div className="cta-overlay">
            <Card
              className="cta-card cta-card--give"
              bordered={false}
              style={{ position: "relative", overflow: "hidden" }}
            >
              <Title level={3}>Cho/Nhận Đồ Dùng Miễn Phí Quanh Bạn</Title>
              <Row gutter={20} className="cta-give-content" align="middle">
                <Col span={14}>
                  <Paragraph type="secondary">
                    Bạn có thể nhận đồ dùng miễn phí bằng cách đăng bài hoặc
                    nhắn tin trực tiếp với người chia sẻ. Nền tảng sử dụng AI
                    giúp ghép nối và định hướng nhu cầu đến người dùng. Hãy trải
                    nghiệm!
                  </Paragraph>
                </Col>
              </Row>
              <Button type="primary" size="large" className="btn-cta-give">
                ĐĂNG BÀI NGAY
              </Button>
              <div className="cta-give-image">
                <Image preview={false} src={chonhan} alt="Give and Receive" />
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 5. Tổ chức từ thiện */}
      <section className="home-orgs">
        <div className="home-section__header">
          <h2 className="home-section__title">TỔ CHỨC TỪ THIỆN</h2>
          <a href="#" className="view-all">
            Xem tất cả <FiChevronRight />
          </a>
        </div>
        <CardCarousel>
          {MOCK_ORGANIZATIONS.map((o, i) => (
            <div
              key={o.id}
              className="home-carousel__slide home-carousel__slide--org"
            >
              <OrganizationCard organization={o} index={i} />
            </div>
          ))}
        </CardCarousel>
      </section>

      <Footer />
    </div>
  );
}
