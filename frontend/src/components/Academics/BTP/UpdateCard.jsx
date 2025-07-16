import { Form } from "react-router";
import hand from "../../../assets/update.svg";

export default function AddUpdateCard() {
  return (
    <div className="Addupdate">
      <h2>ADD an Update</h2>
      <Form action="addupdate" method="post" >
        <div className="add-update-card">
          <div className="add-update-body">
            <div className="update-input-label">
              <img src={hand} alt="" />
              <label htmlFor="update-text">Update</label>
            </div>
            <div className="update-input">
              <div className="update-input-wrapper">
                <textarea
                  id="update-text"
                  className="update-textarea"
                  name="update"
                  placeholder="Write an Update in here."
                  rows={3}
                  defaultValue={null}
                />
              </div>
              <div className="update-submit-wrapper">
                <button className="update-submit-button" type="submit">
                  Add Update
                </button>
              </div>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
}

