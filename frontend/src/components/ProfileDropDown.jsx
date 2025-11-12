import React from "react";
import { Form } from "react-router-dom";
import classes from "./styles/ProfileDropDown.module.css";
import profileIcon from "./../assets/profile.svg"; // Re-using the icon from your header

export default function ProfileDropdown() {
  // Dummy data based on the image
  const dummyData = {
    name: "Sahal Ansar Theparambil",
    email: "sahalansar.t23@iiits.in",
    rollNumber: "S20230010210",
    courses: ["ICS", "FCOMM", "FDFED", "EMTL", "PR", "CCN", "ToC"],
  };

  return (
    <div className={classes.dropdown}>
      <div className={classes.profileIcon}>
        {/* Using the imported icon. You can replace this with the exact one from the image */}
        <img src={profileIcon} alt="Profile" />
      </div>

      <div className={classes.infoSection}>
        <span className={classes.label}>Name</span>
        <span className={classes.value}>{dummyData.name}</span>
      </div>

      <div className={classes.infoSection}>
        <span className={classes.label}>Email</span>
        <span className={classes.value}>{dummyData.email}</span>
      </div>

      <div className={classes.infoSection}>
        <span className={classes.label}>Roll Number</span>
        <span className={classes.value}>{dummyData.rollNumber}</span>
      </div>

      <div className={classes.courseSection}>
        <div className={classes.courseHeader}>
          <span className={classes.label}>Courses</span>
          <span className={classes.courseCount}>{dummyData.courses.length}</span>
        </div>
        <div className={classes.courseGrid}>
          {dummyData.courses.map((course) => (
            <span key={course} className={classes.courseTag}>
              {course}
            </span>
          ))}
        </div>
      </div>

      <div className={classes.actionButtons}>
        {/* Assuming these are buttons, not links, for now */}
        <button className={classes.actionBtn}>Change Password</button>
        {/* This should ideally be a Form for the logout action */}
        <Form action="/logout" method="post">
          <button className={classes.actionBtn}>Log Out</button>
        </Form>
      </div>
    </div>
  );
}