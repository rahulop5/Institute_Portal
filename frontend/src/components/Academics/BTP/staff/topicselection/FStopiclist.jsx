import { useState } from "react";
import StudentTooltip from "./StudentTooltip";
import classes from "../../../../styles/FacultySelection.module.css";
import studentIcon from "../../../../../assets/studenticon.svg";
import trash from "../../../../../assets/trashcan.png";
import hoverTrash from "../../../../../assets/whitetrash.png";

export default function TopicCards({
  topics,
  mode,
  handleApply,
  bin,
  onDeleteTeam,
  selectedTeam,
  onAssignTopic,
}) {
  const [openCardKey, setOpenCardKey] = useState(null); 
  const [hoveredDeleteKey, setHoveredDeleteKey] = useState(null);
  const [hoveredStudent, setHoveredStudent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState(null);

  const toggleTeams = (key) => {
    setOpenCardKey((prevKey) => (prevKey === key ? null : key)); 
  };

  const handleStudentHover = (student, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setHoveredStudent(student);
    setTooltipPosition({
      top: rect.top + window.scrollY - 10,
      left: rect.left + rect.width / 2 + window.scrollX,
    });
  };

  const handleStudentLeave = () => {
    setHoveredStudent(null);
    setTooltipPosition(null);
  };

  return (
    <div className={classes["facultytopics-wrapper"]}>
      <h2 className={classes["facultytopics-heading"]}>Available Topics</h2>

      <div className={classes["facultytopics-grid"]}>
        {topics.map((topic, idx) => {
          const key = topic?._id ?? idx;
          const isOpen = openCardKey === key; // ✅ only one open at a time

          return (
            <div className={classes["facultytopics-card"]} key={key}>
              <div>
                <h3 className={classes["facultytopics-title"]}>
                  {topic.topic}
                </h3>
                <p className={classes["facultytopics-description"]}>
                  {topic.about}
                </p>
              </div>

              {mode === "student" && bin === 1 && (
                <div className={classes["facultytopics-actions"]}>
                  <button
                    className={classes["facultytopics-button"]}
                    onClick={() => handleApply(topic)}
                  >
                    Apply
                  </button>
                </div>
              )}

              {mode === "faculty" && (
                <div className={classes["facultytopics-actions"]}>
                  {selectedTeam ? (
                    <button
                      className={classes["facultytopics-button"]}
                      onClick={() => onAssignTopic && onAssignTopic(topic)}
                    >
                      Assign
                    </button>
                  ) : (
                    <button
                      className={classes["facultytopics-button"]}
                      onClick={() => toggleTeams(key)}
                    >
                      {isOpen ? "Hide Teams" : "View Teams"}
                    </button>
                  )}
                </div>
              )}

              {mode === "faculty" && !selectedTeam && isOpen && (
                <div className={classes["topic-teams"]}>
                  {Array.isArray(topic.teams) && topic.teams.length > 0 ? (
                    <div className={classes["topic-teams-row"]}>
                      {topic.teams.map((team, tIdx) => (
                        <div className={classes["team-card"]} key={tIdx}>
                          <div className={classes["team-card-header"]}>
                            {team.teamName}
                          </div>

                          <div className={classes["team-card-content"]}>
                            <div className={classes["team-card-members"]}>
                              {(team.members || []).map((m, mIdx) => (
                                <div
                                  className={classes["studentIconWrapper"]}
                                  key={mIdx}
                                  onMouseEnter={(e) =>
                                    handleStudentHover(m, e)
                                  }
                                  onMouseLeave={handleStudentLeave}
                                >
                                  <img
                                    src={m.avatar || studentIcon}
                                    alt={m?.name || "student"}
                                    className={classes["studentIconteamlist"]}
                                  />
                                </div>
                              ))}
                            </div>
                            <div className={classes["team-card-delete"]}>
                              <button
                                className={classes["delete-button"]}
                                onClick={() =>
                                  onDeleteTeam ? onDeleteTeam(team) : null
                                }
                                onMouseEnter={() =>
                                  setHoveredDeleteKey(`${key}-${tIdx}`)
                                }
                                onMouseLeave={() => setHoveredDeleteKey(null)}
                              >
                                <img
                                  src={
                                    hoveredDeleteKey === `${key}-${tIdx}`
                                      ? hoverTrash
                                      : trash
                                  }
                                  alt="Delete Team"
                                  className={classes["delete-icon"]}
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={classes["topic-teams-empty"]}>
                      No teams have selected this topic yet.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

  
      <StudentTooltip student={hoveredStudent} position={tooltipPosition} />
    </div>
  );
}
