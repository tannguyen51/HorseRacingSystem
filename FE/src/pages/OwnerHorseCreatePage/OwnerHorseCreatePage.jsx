import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createHorse } from "../../services/ownerHorseApi";
import { request } from "../../services/apiClient";
import { validateHorseStats } from "../../utils/horseValidation";
import "../OwnerSharedLayout.css";
import "../OwnerHorseFormPage.css";

function OwnerHorseCreatePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [formValues, setFormValues] = useState({
    name: "", breed: "", gender: "", dateOfBirth: "", age: "",
    weight: "", height: "", color: "", totalRaces: "", totalWins: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const parseNumber = (value) => {
    if (!value) return undefined;
    const n = Number(value.toString().replace(/[^0-9.]/g, ""));
    return Number.isNaN(n) ? undefined : n;
  };

  const updateField = (field) => (event) => {
    const value = event.target.value;
    setFormValues((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "dateOfBirth" && value) {
        const birth = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        next.age = age > 0 ? String(age) : "";
      }
      return next;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Max 5MB."); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const name = formValues.name.trim();
    if (!name) { setError("Horse name is required."); return; }

    const age = parseNumber(formValues.age) ?? 0;
    const validationError = validateHorseStats({ dateOfBirth: formValues.dateOfBirth, age, totalRaces: parseNumber(formValues.totalRaces) ?? 0, totalWins: parseNumber(formValues.totalWins) ?? 0 });
    if (validationError) { setError(validationError); return; }

    setIsSubmitting(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        setUploading(true);
        try {
          const formData = new FormData();
          formData.append("file", imageFile);
          const data = await request("/api/horses/upload-image", { method: "POST", body: formData });
          imageUrl = data?.url || null;
          if (!imageUrl) { setError("Upload failed: no URL returned."); setIsSubmitting(false); return; }
        } catch (e) {
          setError("Upload failed: " + e.message);
          setIsSubmitting(false);
          return;
        } finally { setUploading(false); }
      }

      await createHorse({
        name,
        breed: formValues.breed.trim() || undefined,
        gender: formValues.gender.trim() || undefined,
        dateOfBirth: formValues.dateOfBirth || undefined,
        age,
        weight: parseNumber(formValues.weight),
        height: parseNumber(formValues.height),
        color: formValues.color.trim() || undefined,
        totalRaces: parseNumber(formValues.totalRaces) ?? 0,
        totalWins: parseNumber(formValues.totalWins) ?? 0,
        imageUrl: imageUrl || undefined,
      });
      navigate("/owner/horses");
    } catch (e) {
      setError(e?.message || "Unable to save horse.");
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="owner-page owner-horse-form-page">
      <div className="owner-layout">
        <aside className="owner-sidebar">
          <div className="owner-sidebar__header">
            <p className="pill">Horse Owner</p>
            <h3>Create horse</h3>
            <p className="muted">Add a new horse profile to your stable.</p>
          </div>
        </aside>

        <div className="owner-content">
          <section className="page-header"><h1>Create horse</h1><p>Enter horse profile details for approval.</p></section>

          <form className="horse-form-card" onSubmit={handleSubmit}>
            <div className="horse-form-grid">
              <div className="form-section">
                <h3>Horse image</h3>
                <div className="image-upload-area" style={{ display: "flex", gap: 20, alignItems: "start" }}>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: 200, height: 160, border: "2px dashed rgba(231,198,120,.2)", borderRadius: 14,
                      display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                      background: imagePreview ? `url(${imagePreview}) center/cover no-repeat` : "rgba(231,198,120,.04)",
                      overflow: "hidden", flexShrink: 0,
                    }}
                  >
                    {!imagePreview && <span style={{ color: "#7f899a", fontSize: 13 }}>Click to upload</span>}
                  </div>
                  <div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                    <p className="muted" style={{ fontSize: 13 }}>JPG, PNG, GIF, WEBP (max 5MB)</p>
                    {imageFile && <p style={{ color: "#6ee7b7", fontSize: 13 }}>{imageFile.name}</p>}
                    <button type="button" className="ghost-button" onClick={() => { setImageFile(null); setImagePreview(""); if (fileInputRef.current) fileInputRef.current.value = ""; }} style={{ marginTop: 8 }}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Horse details</h3>
                <div className="form-field">
                  <label className="label-required" htmlFor="horse-name">Horse name</label>
                  <input id="horse-name" className="form-input" type="text" placeholder="Enter horse name" value={formValues.name} onChange={updateField("name")} required />
                </div>
                <div className="form-grid-two">
                  <div className="form-field">
                    <label htmlFor="horse-breed">Breed</label>
                    <input id="horse-breed" className="form-input" type="text" placeholder="Thoroughbred" value={formValues.breed} onChange={updateField("breed")} />
                  </div>
                  <div className="form-field">
                    <label htmlFor="horse-gender">Gender</label>
                    <input id="horse-gender" className="form-input" type="text" placeholder="Mare / Stallion" value={formValues.gender} onChange={updateField("gender")} />
                  </div>
                </div>
                <div className="form-grid-two">
                  <div className="form-field">
                    <label htmlFor="horse-color">Color</label>
                    <input id="horse-color" className="form-input" type="text" placeholder="Bay" value={formValues.color} onChange={updateField("color")} />
                  </div>
                  <div className="form-field">
                    <label htmlFor="horse-dob">Date of birth</label>
                    <input id="horse-dob" className="form-input" type="date" value={formValues.dateOfBirth} onChange={updateField("dateOfBirth")} />
                  </div>
                </div>
                <div className="form-grid-three">
                  <div className="form-field">
                    <label htmlFor="horse-age">Age (auto)</label>
                    <input id="horse-age" className="form-input" type="number" placeholder="Auto from DOB" value={formValues.age} readOnly style={{ background: "rgba(231,198,120,.04)", cursor: "not-allowed" }} />
                  </div>
                  <div className="form-field">
                    <label htmlFor="horse-weight">Weight (kg)</label>
                    <input id="horse-weight" className="form-input" type="text" placeholder="480" value={formValues.weight} onChange={updateField("weight")} />
                  </div>
                  <div className="form-field">
                    <label htmlFor="horse-height">Height (cm)</label>
                    <input id="horse-height" className="form-input" type="text" placeholder="165" value={formValues.height} onChange={updateField("height")} />
                  </div>
                </div>
                <div className="form-section">
                  <h3>Career totals</h3>
                  <div className="form-grid-two">
                    <div className="form-field">
                      <label htmlFor="horse-total-races">Total races</label>
                      <input id="horse-total-races" className="form-input" type="number" placeholder="0" value={formValues.totalRaces} onChange={updateField("totalRaces")} min={0} />
                    </div>
                    <div className="form-field">
                      <label htmlFor="horse-total-wins">Total wins</label>
                      <input id="horse-total-wins" className="form-input" type="number" placeholder="0" value={formValues.totalWins} onChange={updateField("totalWins")} min={0} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="form-actions">
              <button className="ghost-button" type="button" onClick={() => navigate("/owner/horses")}>Cancel</button>
              <button className="primary-button" type="submit" disabled={isSubmitting || uploading}>
                {uploading ? "Uploading..." : isSubmitting ? "Saving..." : "Save horse"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OwnerHorseCreatePage;
