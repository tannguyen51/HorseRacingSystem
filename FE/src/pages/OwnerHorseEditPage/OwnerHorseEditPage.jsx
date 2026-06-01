import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getHorse, updateHorse } from "../../services/ownerHorseApi";
import "../OwnerSharedLayout.css";
import "../OwnerHorseFormPage.css";

function OwnerHorseEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formValues, setFormValues] = useState({
    name: "",
    breed: "",
    gender: "",
    dateOfBirth: "",
    age: "",
    weight: "",
    height: "",
    color: "",
    totalRaces: "",
    totalWins: "",
    imageUrl: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const requiredCount = 2;

  const parseNumber = (value) => {
    if (!value) {
      return undefined;
    }
    const normalized = value.toString().replace(/[^0-9.]/g, "");
    if (!normalized) {
      return undefined;
    }
    const parsed = Number(normalized);
    return Number.isNaN(parsed) ? undefined : parsed;
  };

  useEffect(() => {
    const fetchHorse = async () => {
      try {
        const horse = await getHorse(id);
        setFormValues({
          name: horse.name ?? "",
          breed: horse.breed ?? "",
          gender: horse.gender ?? "",
          dateOfBirth: horse.dateOfBirth
            ? horse.dateOfBirth.slice(0, 10)
            : "",
          age: horse.age != null ? String(horse.age) : "",
          weight: horse.weight != null ? String(horse.weight) : "",
          height: horse.height != null ? String(horse.height) : "",
          color: horse.color ?? "",
          totalRaces:
            horse.totalRaces != null ? String(horse.totalRaces) : "",
          totalWins: horse.totalWins != null ? String(horse.totalWins) : "",
          imageUrl: horse.imageUrl ?? "",
        });
      } catch (fetchError) {
        setError(fetchError?.message || "Unable to load horse.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHorse();
  }, [id]);

  const updateField = (field) => (event) => {
    const value = event.target.value;
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const name = formValues.name.trim();
    if (!name) {
      setError("Horse name is required.");
      return;
    }

    const payload = {
      name,
      breed: formValues.breed.trim() || undefined,
      gender: formValues.gender.trim() || undefined,
      dateOfBirth: formValues.dateOfBirth || undefined,
      age: parseNumber(formValues.age) ?? 0,
      weight: parseNumber(formValues.weight),
      height: parseNumber(formValues.height),
      color: formValues.color.trim() || undefined,
      totalRaces: parseNumber(formValues.totalRaces) ?? 0,
      totalWins: parseNumber(formValues.totalWins) ?? 0,
      imageUrl: formValues.imageUrl.trim() || undefined,
    };

    setIsSubmitting(true);
    try {
      await updateHorse(id, payload);
      navigate("/owner/horses");
    } catch (submitError) {
      setError(submitError?.message || "Unable to save horse.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="owner-page owner-horse-form-page">
        <div className="owner-layout">
          <div className="owner-content">
            <p className="muted">Loading horse data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="owner-page owner-horse-form-page">
      <div className="owner-layout">
        <aside className="owner-sidebar">
          <div className="owner-sidebar__header">
            <p className="pill">Horse Owner</p>
            <h3>Edit horse</h3>
            <p className="muted">Update stats and racing readiness.</p>
          </div>
          <div className="owner-sidebar__card">
            <p className="muted">Required fields</p>
            <h4>{requiredCount} fields</h4>
            <span>Before saving</span>
          </div>
        </aside>

        <div className="owner-content">
          <section className="page-header">
            <h1>Edit horse</h1>
            <p>Review horse information and update racing details.</p>
          </section>

          <form className="horse-form-card" onSubmit={handleSubmit}>
            <div className="horse-form-grid">
              <div className="form-section">
                <h3>Horse image</h3>
                <div className="image-upload">
                  <div
                    className="image-preview"
                    aria-hidden="true"
                    style={
                      formValues.imageUrl
                        ? {
                            backgroundImage: `url(${formValues.imageUrl})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : undefined
                    }
                  />
                  <div className="form-field">
                    <label htmlFor="horse-image-url">Image URL</label>
                    <input
                      id="horse-image-url"
                      className="form-input"
                      type="url"
                      placeholder="https://..."
                      value={formValues.imageUrl}
                      onChange={updateField("imageUrl")}
                    />
                    <p className="form-hint">Provide a hosted image URL.</p>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Horse details</h3>
                <div className="form-field">
                  <label className="label-required" htmlFor="horse-name">
                    Horse name
                  </label>
                  <input
                    id="horse-name"
                    className="form-input"
                    type="text"
                    placeholder="Enter horse name"
                    value={formValues.name}
                    onChange={updateField("name")}
                    required
                  />
                </div>
                <div className="form-grid-two">
                  <div className="form-field">
                    <label htmlFor="horse-breed">Breed</label>
                    <input
                      id="horse-breed"
                      className="form-input"
                      type="text"
                      placeholder="Thoroughbred"
                      value={formValues.breed}
                      onChange={updateField("breed")}
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="horse-gender">Gender</label>
                    <input
                      id="horse-gender"
                      className="form-input"
                      type="text"
                      placeholder="Mare / Stallion"
                      value={formValues.gender}
                      onChange={updateField("gender")}
                    />
                  </div>
                </div>
                <div className="form-grid-two">
                  <div className="form-field">
                    <label htmlFor="horse-color">Color</label>
                    <input
                      id="horse-color"
                      className="form-input"
                      type="text"
                      placeholder="Bay"
                      value={formValues.color}
                      onChange={updateField("color")}
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="horse-dob">Date of birth</label>
                    <input
                      id="horse-dob"
                      className="form-input"
                      type="date"
                      value={formValues.dateOfBirth}
                      onChange={updateField("dateOfBirth")}
                    />
                  </div>
                </div>
                <div className="form-grid-three">
                  <div className="form-field">
                    <label className="label-required" htmlFor="horse-age">
                      Age
                    </label>
                    <input
                      id="horse-age"
                      className="form-input"
                      type="number"
                      placeholder="4"
                      value={formValues.age}
                      onChange={updateField("age")}
                      min={0}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="horse-weight">Weight (kg)</label>
                    <input
                      id="horse-weight"
                      className="form-input"
                      type="text"
                      placeholder="480"
                      value={formValues.weight}
                      onChange={updateField("weight")}
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="horse-height">Height (cm)</label>
                    <input
                      id="horse-height"
                      className="form-input"
                      type="text"
                      placeholder="165"
                      value={formValues.height}
                      onChange={updateField("height")}
                    />
                  </div>
                </div>
                <div className="form-section">
                  <h3>Career totals</h3>
                  <div className="form-grid-two">
                    <div className="form-field">
                      <label htmlFor="horse-total-races">Total races</label>
                      <input
                        id="horse-total-races"
                        className="form-input"
                        type="number"
                        placeholder="0"
                        value={formValues.totalRaces}
                        onChange={updateField("totalRaces")}
                        min={0}
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="horse-total-wins">Total wins</label>
                      <input
                        id="horse-total-wins"
                        className="form-input"
                        type="number"
                        placeholder="0"
                        value={formValues.totalWins}
                        onChange={updateField("totalWins")}
                        min={0}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {error ? <p className="form-error">{error}</p> : null}

            <div className="form-actions">
              <button
                className="ghost-button"
                type="button"
                onClick={() => navigate("/owner/horses")}
              >
                Cancel
              </button>
              <button
                className="primary-button"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save horse"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OwnerHorseEditPage;