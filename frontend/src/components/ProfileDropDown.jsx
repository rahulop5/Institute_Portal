import React from "react";
import { Form, Link } from "react-router-dom";
import classes from "./styles/ProfileDropDown.module.css";
import profileIcon from "./../assets/profile.svg";

export default function ProfileDropdown({ profile, loading, error }) {
  // INTERNAL STATE AND FETCHING LOGIC REMOVED
  // Props are now received from Header.jsx

  if (loading) {
    return (
      <div className={classes.dropdown}>
        <div className={classes.infoSection}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={classes.dropdown}>
        <div className={classes.infoSection}>Error loading profile</div>
      </div>
    );
  }

  if (!profile) return null;

  const isStudent = ["UGStudentBTP", "UGStudentHonors", "Student"].includes(profile.role);
  const isFaculty = profile.role?.toLowerCase() === "faculty";
  const isAdmin = profile.role?.toLowerCase() === "admin";

  return (
    <div className={classes.dropdown}>
      <div className={classes.profileIcon}>
        <img src={profileIcon} alt="Profile" />
      </div>

      <div className={classes.infoSection}>
        <span className={classes.label}>Name</span>
        <span className={classes.value}>{profile.name}</span>
      </div>

      <div className={classes.infoSection}>
        <span className={classes.label}>Email</span>
        <span className={classes.value}>{profile.email}</span>
      </div>

      {isStudent && (
        <>
          <div className={classes.infoSection}>
            <span className={classes.label}>Roll Number</span>
            <span className={classes.value}>{profile.rollNumber || "N/A"}</span>
          </div>
          <div className={classes.infoSection}>
            <span className={classes.label}>Department</span>
            <span className={classes.value}>{profile.department || "N/A"}</span>
          </div>
          <div className={classes.infoSection}>
            <span className={classes.label}>Batch</span>
            <span className={classes.value}>{profile.batch || "N/A"}</span>
          </div>
          {profile.courses && profile.courses.length > 0 && (
            <div className={classes.infoSection}>
              <span className={classes.label}>Enrolled Courses</span>
              <ul className="list-disc pl-5 text-sm text-gray-600">
                {profile.courses.map((course, index) => (
                  <li key={index}>{course.name} ({course.code})</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {isFaculty && (
        <>
          <div className={classes.infoSection}>
            <span className={classes.label}>Employee No</span>
            <span className={classes.value}>{profile.emp_no || "N/A"}</span>
          </div>
          <div className={classes.infoSection}>
            <span className={classes.label}>Department</span>
            <span className={classes.value}>{profile.dept || "N/A"}</span>
          </div>
           <div className={classes.infoSection}>
            <span className={classes.label}>Role</span>
            <span className={classes.value}>{profile.role || "N/A"}</span>
          </div>
          {profile.courses && profile.courses.length > 0 && (
            <div className={classes.infoSection}>
              <span className={classes.label}>Teaching Courses</span>
              <ul className="list-disc pl-5 text-sm text-gray-600">
                {profile.courses.map((course, index) => (
                  <li key={index}>{course.name} ({course.code})</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {isAdmin && (
        <>
          <div className={classes.infoSection}>
            <span className={classes.label}>Department</span>
            <span className={classes.value}>{profile.departments || "N/A"}</span>
          </div>
        </>
      )}

      <div className={classes.actionButtons}>
        <Link to="/change-password">
          <button className={classes.actionBtn}>Change Password</button>
        </Link>
        <Form action="/logout" method="post">
          <button className={classes.actionBtn}>Log Out</button>
        </Form>
      </div>
    </div>
  );
}