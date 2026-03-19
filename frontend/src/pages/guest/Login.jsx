export default function LoginPage() {
  return (
    <div className="page page--center">
      <h1>Đăng nhập</h1>
      <div className="stack section">
        <p className="muted">Public route: /login</p>
        <p className="muted">
          Test nhanh: mở DevTools và set localStorage token/role, rồi vào /app,
          /org, /admin.
        </p>
      </div>
    </div>
  );
}
