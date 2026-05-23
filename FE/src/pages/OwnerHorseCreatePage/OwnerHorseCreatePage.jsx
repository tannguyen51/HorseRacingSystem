import "../OwnerSharedLayout.css";
import "../OwnerHorseFormPage.css";

function OwnerHorseCreatePage() {
  return (
    <div className="owner-page owner-horse-form-page">
      <div className="owner-layout">
        <aside className="owner-sidebar">
          <div className="owner-sidebar__header">
            <p className="pill">Horse Owner</p>
            <h3>Create horse</h3>
            <p className="muted">Add a new horse profile to your stable.</p>
          </div>
          <div className="owner-sidebar__card">
            <p className="muted">Required fields</p>
            <h4>6 fields</h4>
            <span>Before saving</span>
          </div>
        </aside>

        <div className="owner-content">
          <section className="page-header">
            <h1>Create horse</h1>
            <p>Upload horse details, stats, and status information.</p>
          </section>

          <form className="horse-form-card">
            <div className="horse-form-grid">
              <div className="form-section">
                <h3>Horse image</h3>
                <div className="image-upload">
                  <div className="image-preview" aria-hidden="true" />
                  <div className="form-field">
                    <label className="label-required" htmlFor="horse-image">
                      Upload image
                    </label>
                    <input
                      id="horse-image"
                      className="form-file"
                      type="file"
                      accept="image/*"
                    />
                    <p className="form-hint">PNG or JPG, up to 5MB.</p>
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
                  />
                </div>
                <div className="form-grid-two">
                  <div className="form-field">
                    <label className="label-required" htmlFor="horse-breed">
                      Breed
                    </label>
                    <input
                      id="horse-breed"
                      className="form-input"
                      type="text"
                      placeholder="Thoroughbred"
                    />
                  </div>
                  <div className="form-field">
                    <label className="label-required" htmlFor="horse-age">
                      Age
                    </label>
                    <input
                      id="horse-age"
                      className="form-input"
                      type="number"
                      placeholder="4"
                    />
                  </div>
                </div>
                <div className="form-grid-two">
                  <div className="form-field">
                    <label className="label-required" htmlFor="horse-weight">
                      Weight
                    </label>
                    <input
                      id="horse-weight"
                      className="form-input"
                      type="text"
                      placeholder="480 kg"
                    />
                  </div>
                  <div className="form-field">
                    <label className="label-required" htmlFor="horse-status">
                      Status
                    </label>
                    <select id="horse-status" className="form-select">
                      <option>Active</option>
                      <option>Training</option>
                      <option>Resting</option>
                      <option>Medical</option>
                    </select>
                  </div>
                </div>
                <div className="form-section">
                  <h3>Speed stats</h3>
                  <div className="form-grid-three">
                    <div className="form-field">
                      <label className="label-required" htmlFor="speed-rating">
                        Speed rating
                      </label>
                      <input
                        id="speed-rating"
                        className="form-input"
                        type="number"
                        placeholder="92"
                      />
                    </div>
                    <div className="form-field">
                      <label className="label-required" htmlFor="stamina">
                        Stamina
                      </label>
                      <input
                        id="stamina"
                        className="form-input"
                        type="number"
                        placeholder="86"
                      />
                    </div>
                    <div className="form-field">
                      <label className="label-required" htmlFor="sprint">
                        Sprint
                      </label>
                      <input
                        id="sprint"
                        className="form-input"
                        type="number"
                        placeholder="88"
                      />
                    </div>
                  </div>
                </div>
                <div className="form-field">
                  <label className="label-required" htmlFor="horse-description">
                    Description
                  </label>
                  <textarea
                    id="horse-description"
                    className="form-textarea"
                    placeholder="Write a short description"
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button className="ghost-button" type="button">
                Cancel
              </button>
              <button className="primary-button" type="submit">
                Save horse
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OwnerHorseCreatePage;
