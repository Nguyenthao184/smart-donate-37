export default function GuestHomePage() {
  return (
    <div className="page page--center">
      <h1>Trang vãng lai</h1>
      <p className="muted">Public route</p>
      <div className="links">
        <a className="link" href="/login">
          Đi tới /login
        </a>
        <a className="link" href="/app">
          Đi tới /app
        </a>
        <a className="link" href="/org">
          Đi tới /org
        </a>
        <a className="link" href="/admin">
          Đi tới /admin
        </a>
      </div>
    </div>
  )
}
