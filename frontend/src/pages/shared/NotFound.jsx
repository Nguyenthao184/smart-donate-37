export default function NotFoundPage() {
  return (
    <div className="page page--center">
      <h1>404</h1>
      <div className="stack section">
        <p className="muted">Không tìm thấy trang.</p>
        <div className="links links--tight">
          <a className="link" href="/">
            Về trang chủ
          </a>
        </div>
      </div>
    </div>
  )
}
