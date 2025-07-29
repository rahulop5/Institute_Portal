import classes from "../../../../styles/FacultySelection.module.css";

export default function TopicCards({ topics, handleApply, bin }) {
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
                className={classes["facultytopics-button"]}
                onClick={() => handleApply(topic)}
              >
                Apply
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
