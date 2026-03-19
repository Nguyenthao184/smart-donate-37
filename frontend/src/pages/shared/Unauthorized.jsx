export default function UnauthorizedPage() {
  return (
    <div className="page page--center">
      <h1>403</h1>
      <div className="stack section">
        <p className="muted">Bạn không có quyền truy cập trang này.</p>
        <div className="links links--tight">
          <a className="link" href="/">
            Về trang chủ
          </a>
        </div>
      </div>
    </div>
  );
}
