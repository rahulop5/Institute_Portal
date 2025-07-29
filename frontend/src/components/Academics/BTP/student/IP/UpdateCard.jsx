import { Form } from "react-router";
import hand from "../../../../../assets/update.svg";
import classes from "../../../../styles/Inprogress.module.css";

export default function AddUpdateCard() {
  return (
    <div className={classes["Addupdate"]}>
      <h2>ADD an Update</h2>
      <Form action="addupdate" method="post">
        <div className={classes["add-update-card"]}>
          <div className={classes["add-update-body"]}>
            <div className={classes["update-input-label"]}>
              <img src={hand} alt="" />
              <label htmlFor="update-text">Update</label>
            </div>
            <div className={classes["update-input"]}>
              <div className={classes["update-input-wrapper"]}>
                <textarea
                  id="update-text"
                  className={classes["update-textarea"]}
                  name="update"
                  placeholder="Write an Update in here."
                  rows={3}
                  defaultValue={null}
                />
              </div>
              <div className={classes["update-submit-wrapper"]}>
                <button
                  className={classes["update-submit-button"]}
                  type="submit"
                >
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
