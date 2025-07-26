export default function TopicCards({ topics, handleApply, bin }) {
  return (
    <div className="facultytopics-wrapper">
      <h2 className="facultytopics-heading">Available Topics</h2>
      <div className="facultytopics-grid">
        {topics.map((topic, idx) => (
          <div className="facultytopics-card" key={idx}>
            <h3 className="facultytopics-title">{topic.topic}</h3>
            <p className="facultytopics-description">{topic.about}</p>
            {bin===1?<button className="facultytopics-button" onClick={()=>handleApply(topic)} >
              Apply
            </button>:<></>}
          </div>
        ))}
      </div>
    </div>
  );
}
