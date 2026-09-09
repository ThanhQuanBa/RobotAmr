import { Component } from 'react';

export default class AppErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error, info) { console.error('CampusPath render error', error, info); }
  render() {
    if (this.state.failed) return <div className="app-recovery" role="alert">
      <h1>Không thể hiển thị trang</h1>
      <p>Trang gặp lỗi khi khởi tạo. Vui lòng tải lại để thử lại.</p>
      <button onClick={() => window.location.reload()}>Tải lại trang</button>
      <a href="/">Về trang chủ</a>
    </div>;
    return this.props.children;
  }
}
