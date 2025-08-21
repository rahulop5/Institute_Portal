import React from "react";
import studentIcon from "../../../../../assets/studenticon.svg";
import BinButtons from "./BinButtons"
import classes from "../styles/StudentLits.module.css";

const StudentList = ({ students }) => {
    return (
        <div>

            <div className={classes["student-list"]}>
                <div className={classes["student-list-scroll"]}>
                    {students.map((student) => (
                        <div className={classes["student-row"]} key={student.rollno}>
                            <div className={classes["student-icon"]}>
                                <img src={studentIcon} alt="Student Icon" />
                            </div>
                            <div className={classes["student-details"]}>
                                <div className={classes["student-info"]}>
                                    <div className={classes["student-name"]}>{student.name}</div>
                                    <div className={classes["student-meta"]}>{student.email}</div>
                                </div>
                                <div className={classes["rollselect"]}>
                                    <div className={classes["student-roll"]}>{student.rollno}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StudentList;
