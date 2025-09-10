import React from "react";
import classes from "../../../../styles/PreferenceOrder.module.css";
import nothing from "../../../../../assets/Group 421.png";

const PreferenceOrder = ({ preferences, onDelete, onFinalize }) => {
  const allFilled = preferences.every((p) => p);

  return (
    <div className={classes.wrapper}>
      <h3 className={classes.title}>Preference Order</h3>
      <div className={classes.list}>
        {preferences.map((pref, index) => (
          <div key={index} className={classes.slot}>
            {pref ? (
              <>
                <div className={classes.card}>
                  <div>
                    <h1>{index + 1}</h1>
                  </div>
                  <div className={classes.info}>
                    <div>
                      <div className={classes.topic}>{pref.title}</div>
                      <div className={classes.desc}>{pref.description}</div>
                    </div>
                    <div className={classes.faculty}>
                      Faculty: {pref.facultyName}
                    </div>
                  </div>
                </div>
                <div className={classes.deletewrapper}>
                  <button
                    className={classes.delete}
                    onClick={() => onDelete(index)}
                  >
                    Delete
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className={classes.emptycard}>
                  <div>
                    <h1>{index + 1}</h1>
                  </div>
                  <div className={classes.empty}>
                    <div className={classes.emptyimage}>
                      <img src={nothing} alt="" />
                    </div>
                    <div className={classes.emptytext}>No topic selected</div>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className={classes.footer}>
        <button
          className={classes.finalize}
          disabled={!allFilled}
          onClick={onFinalize}
        >
          Finalise Order
        </button>
      </div>
    </div>
  );
};

export default PreferenceOrder;
