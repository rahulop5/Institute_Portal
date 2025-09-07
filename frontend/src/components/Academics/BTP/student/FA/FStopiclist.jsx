import classes from "../../../../styles/FacultySelection.module.css";

export default function TopicCards({ topics, handleApply, bin,currentPrefIndex={currentPrefIndex},
              handleAddPreference={handleAddPreference},preferences }) {
  return (
    <div className={classes["facultytopics-wrapper"]}>
      <h2 className={classes["facultytopics-heading"]}>Available Topics</h2>
      <div className={classes["facultytopics-grid"]}>
        {topics.map((topic, idx) => (
          <div className={classes["facultytopics-card"]} key={idx}>
            <h3 className={classes["facultytopics-title"]}>{topic.topic}</h3>
            <p className={classes["facultytopics-description"]}>{topic.about}</p>
            {bin === 1 ? (
              <button
                disabled={preferences.filter(Boolean).length === 4}
                onClick={() => handleAddPreference(topic)}
                className={classes["facultytopics-button"]}
              >
                Apply for Preference {preferences.filter(Boolean).length + 1}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}