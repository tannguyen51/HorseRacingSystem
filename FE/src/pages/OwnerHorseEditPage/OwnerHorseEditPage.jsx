import "../OwnerSharedLayout.css";
import "../OwnerHorseFormPage.css";

function OwnerHorseEditPage() {
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
            <p className="muted">Current status</p>
            <h4>Active</h4>
            <span>Last updated today</span>
          </div>
        </aside>

        <div className="owner-content">
          <section className="page-header">
            <h1>Edit horse</h1>
            <p>Review horse information and update racing details.</p>
          </section>

          <form className="horse-form-card">
            <div className="horse-form-grid">
              <div className="form-section">
                <h3>Horse image</h3>
                <div className="image-upload">
                  <div className="image-preview" aria-hidden="true" />
                  <div className="form-field">
                    <label
                      className="label-required"
                      htmlFor="edit-horse-image"
                    >
                      Update image
                    </label>
                    <input
                      id="edit-horse-image"
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
                  <label className="label-required" htmlFor="edit-horse-name">
                    Horse name
                  </label>
                  <input
                    id="edit-horse-name"
                    className="form-input"
                    type="text"
                    defaultValue="Thunder Strike"
                  />
                </div>
                <div className="form-grid-two">
                  <div className="form-field">
                    <label
                      className="label-required"
                      htmlFor="edit-horse-breed"
                    >
                      Breed
                    </label>
                    <input
                      id="edit-horse-breed"
                      className="form-input"
                      type="text"
                      defaultValue="Thoroughbred"
                    />
                  </div>
                  <div className="form-field">
                    <label className="label-required" htmlFor="edit-horse-age">
                      Age
                    </label>
                    <input
                      id="edit-horse-age"
                      className="form-input"
                      type="number"
                      defaultValue={4}
                    />
                  </div>
                </div>
                <div className="form-grid-two">
                  <div className="form-field">
                    <label
                      className="label-required"
                      htmlFor="edit-horse-weight"
                    >
                      Weight
                    </label>
                    <input
                      id="edit-horse-weight"
                      className="form-input"
                      type="text"
                      defaultValue="480 kg"
                    />
                  </div>
                  <div className="form-field">
                    <label
                      className="label-required"
                      htmlFor="edit-horse-status"
                    >
                      Status
                    </label>
                    <select id="edit-horse-status" className="form-select">
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
                      <label
                        className="label-required"
                        htmlFor="edit-speed-rating"
                      >
                        Speed rating
                      </label>
                      <input
                        id="edit-speed-rating"
                        className="form-input"
                        type="number"
                        defaultValue={94}
                      />
                    </div>
                    <div className="form-field">
                      <label className="label-required" htmlFor="edit-stamina">
                        Stamina
                      </label>
                      <input
                        id="edit-stamina"
                        className="form-input"
                        type="number"
                        defaultValue={86}
                      />
                    </div>
                    <div className="form-field">
                      <label className="label-required" htmlFor="edit-sprint">
                        Sprint
                      </label>
                      <input
                        id="edit-sprint"
                        className="form-input"
                        type="number"
                        defaultValue={88}
                      />
                    </div>
                  </div>
                </div>
                <div className="form-field">
                  <label
                    className="label-required"
                    htmlFor="edit-horse-description"
                  >
                    Description
                  </label>
                  <textarea
                    id="edit-horse-description"
                    className="form-textarea"
                    defaultValue="Fast starter with strong finish in mid-distance races."
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button className="ghost-button" type="button">
                Cancel
              </button>
              <button className="primary-button" type="submit">
                Save changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OwnerHorseEditPage;
