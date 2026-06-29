import "./Footer.css";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div>
          <h3>RaceMaster</h3>
          <p>
            Nền tảng hàng đầu cho các giải đua ngựa chuyên nghiệp, kết nối chủ
            ngựa, kỵ sĩ và khán giả trên toàn thế giới.
          </p>
          <div className="footer-badges">
            <span>Từ 2026</span>
            <span>Giải toàn cầu</span>
          </div>
        </div>
        <div>
          <h4>Liên kết nhanh</h4>
          <ul>
            <li>Trang chủ</li>
            <li>Giải đấu</li>
            <li>Bảng xếp hạng</li>
            <li>Kết quả trực tiếp</li>
          </ul>
        </div>
        <div>
          <h4>Dành cho người dùng</h4>
          <ul>
            <li>Chủ Ngựa</li>
            <li>Kỵ Sĩ</li>
            <li>Trọng tài</li>
            <li>Quy định &amp; Hướng dẫn</li>
          </ul>
        </div>
        <div>
          <h4>Liên hệ</h4>
          <ul>
            <li>contact@racemaster.com</li>
            <li>+84 123 456 789</li>
            <li>123 Đại lộ Đua Ngựa</li>
            <li>TP. Hồ Chí Minh, Việt Nam</li>
          </ul>
        </div>
      </div>
      <div className="site-footer__bottom">
        <span>© 2026 RaceMaster - Nền tảng giải đấu</span>
        <div className="footer-links">
          <span>Chính sách bảo mật</span>
          <span>Điều khoản dịch vụ</span>
          <span>Chính sách Cookie</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
