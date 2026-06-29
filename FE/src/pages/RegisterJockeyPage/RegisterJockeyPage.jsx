import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register, uploadDocument } from "../../services/authApi";
import {
  normalizeApiRole,
  ROLE_ID_BY_VALUE,
  unwrapResponseData,
} from "../../services/authRoleUtils";
import "./RegisterJockeyPage.css";

function RegisterJockeyPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [idCardNumber, setIdCardNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseFile, setLicenseFile] = useState("");
  const [agreed, setAgreed] = useState(false);

  const [uploadingLicense, setUploadingLicense] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleFileUpload = async (file, setUrl, setUploading) => {
    if (!file) return;
    setUploading(true);
    setErrorMessage("");
    try {
      const response = await uploadDocument(file);
      const payload = unwrapResponseData(response);
      setUrl(payload?.url ?? "");
    } catch (error) {
      setErrorMessage(error.message || "Tải lên thất bại.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu không khớp.");
      return;
    }

    if (!agreed) {
      setErrorMessage("Bạn phải xác nhận thông tin chính xác.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await register({
        email,
        password,
        role: ROLE_ID_BY_VALUE.jockey,
        fullName: fullName.trim() || null,
        phone: phone.trim() || null,
        address: address.trim() || null,
        dateOfBirth: dateOfBirth || null,
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
        idCardNumber: idCardNumber.trim() || null,
        licenseNumber: licenseNumber.trim() || null,
        licenseFile: licenseFile || null,
      });
      const payload = unwrapResponseData(response);
      const apiRole = normalizeApiRole(payload?.role ?? payload?.Role);

      localStorage.setItem("authToken", payload?.token ?? "");
      localStorage.setItem(
        "authUser",
        JSON.stringify({
          userId: payload?.userId,
          email: payload?.email,
          role: apiRole || "jockey",
        })
      );
      setSuccessMessage("Tài khoản Kỵ sĩ đã được tạo thành công.");
      navigate("/jockey/invitations");
    } catch (error) {
      setErrorMessage(
        error.message || "Đăng ký thất bại. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page register-role-page">
      <section className="page-header">
        <div className="page-header__icon">
          <svg width="56" height="56" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="rgba(143,100,32,0.1)" />
            <path d="M16 32l2-10h12l2 10" stroke="#8f6420" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="24" cy="14" r="4" fill="#8f6420" />
            <path d="M20 22l-4 4M28 22l4 4" stroke="#8f6420" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h1>Đăng ký Kỵ Sĩ</h1>
        <p>
          Đam mê trở thành Kỵ sĩ? Đăng ký để tham gia thi đấu và khẳng định kỹ năng của bạn.
        </p>
      </section>

      <div className="single-card single-card--wide">
        <form className="auth-form" onSubmit={handleSubmit}>
          {/* ── Thông tin cá nhân ── */}
          <fieldset className="form-fieldset">
            <legend className="form-legend">Thông tin cá nhân</legend>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fullname" className="label-required">Họ và tên</label>
                <input id="fullname" type="text" name="name" autoComplete="name" placeholder="Nhập họ và tên của bạn" className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="email" className="label-required">Email</label>
                <input id="email" type="email" name="email" autoComplete="email" placeholder="Nhập địa chỉ email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone" className="label-required">Số điện thoại</label>
                <input id="phone" type="tel" name="phone" autoComplete="tel" placeholder="Nhập số điện thoại" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="dob" className="label-required">Ngày sinh</label>
                <input id="dob" type="date" name="dob" className="form-input" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address" className="label-required">Địa chỉ</label>
              <input id="address" type="text" name="address" autoComplete="street-address" placeholder="Nhập địa chỉ liên hệ" className="form-input" value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>

            <div className="form-row form-row--three">
              <div className="form-group">
                <label htmlFor="height" className="label-required">Chiều cao (cm)</label>
                <input id="height" type="number" step="0.1" min="100" max="250" placeholder="vd: 165.5" className="form-input" value={height} onChange={(e) => setHeight(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="weight" className="label-required">Cân nặng (kg)</label>
                <input id="weight" type="number" step="0.1" min="30" max="200" placeholder="vd: 55.0" className="form-input" value={weight} onChange={(e) => setWeight(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="idCard" className="label-required">Số CCCD / CMND</label>
              <input id="idCard" type="text" name="idCard" placeholder="Nhập số CCCD/CMND của bạn" className="form-input" value={idCardNumber} onChange={(e) => setIdCardNumber(e.target.value)} required />
            </div>
          </fieldset>

          {/* ── Mật khẩu ── */}
          <fieldset className="form-fieldset">
            <legend className="form-legend">Bảo mật</legend>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password" className="label-required">Mật khẩu</label>
                <input id="password" type="password" name="password" autoComplete="new-password" placeholder="Nhập mật khẩu" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="confirm-password" className="label-required">Xác nhận mật khẩu</label>
                <input id="confirm-password" type="password" name="confirmPassword" autoComplete="new-password" placeholder="Xác nhận lại mật khẩu" className="form-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
            </div>
          </fieldset>

          {/* ── Thông tin giấy phép ── */}
          <fieldset className="form-fieldset">
            <legend className="form-legend">Thông tin giấy phép</legend>

            <div className="form-group">
              <label htmlFor="license" className="label-required">Số giấy phép thi đấu (License Number)</label>
              <input id="license" type="text" name="license" placeholder="Nhập số giấy phép thi đấu" className="form-input" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="label-required">Tải lên giấy phép thi đấu (PDF/JPG/PNG)</label>
              <div className="file-upload">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, setLicenseFile, setUploadingLicense);
                  }}
                  className="form-input form-input--file"
                />
                {uploadingLicense && <span className="file-upload__status">Đang tải lên...</span>}
                {licenseFile && !uploadingLicense && (
                  <span className="file-upload__status file-upload__status--success">Đã tải lên</span>
                )}
              </div>
            </div>
          </fieldset>

          {/* ── Xác nhận ── */}
          <div className="confirm-group">
            <div className="terms-agreement">
              <label>
                <input type="checkbox" required />
                <span>
                  Tôi đồng ý với{" "}
                  <a href="#" className="link-accent">Điều khoản dịch vụ</a>{" "}
                  và{" "}
                  <a href="#" className="link-accent">Chính sách bảo mật</a>{" "}
                  của RaceMaster.
                </span>
              </label>
            </div>

            <div className="commitment">
              <label>
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} required />
                <span>Tôi cam kết các thông tin cung cấp là chính xác.</span>
              </label>
            </div>
          </div>

          {errorMessage && <p className="form-error">{errorMessage}</p>}
          {successMessage && <p className="form-success">{successMessage}</p>}

          <button type="submit" className="primary-button btn-block" disabled={isSubmitting}>
            {isSubmitting ? "Đang tạo..." : "Đăng ký Kỵ Sĩ"}
          </button>

          <p className="form-footer">
            Đã có tài khoản?{" "}
            <a href="/login" className="link-accent">Đăng nhập</a>
          </p>
        </form>
      </div>

      <div className="register-role-links">
        <span>Bạn là Chủ ngựa?</span>{" "}
        <Link to="/register/horse-owner" className="link-accent">Đăng ký Chủ ngựa</Link>
        <span className="register-role-links__sep">|</span>
        <Link to="/register" className="link-accent">Đăng ký Khán giả</Link>
      </div>
    </div>
  );
}

export default RegisterJockeyPage;
