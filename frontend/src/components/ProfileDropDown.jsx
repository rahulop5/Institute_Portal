import React, { useState, useEffect } from "react";
import { Form, Link } from "react-router-dom";
import classes from "./styles/ProfileDropDown.module.css";
import profileIcon from "./../assets/profile.svg";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { API_HOST } from "../config";

export default function ProfileDropdown({ profile, loading, error, onNameUpdate }) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [currentName, setCurrentName] = useState("");
  
  // Sync currentName with profile.name whenever profile changes
  useEffect(() => {
    if (profile?.name) {
      setCurrentName(profile.name);
      setEditedName(profile.name);
    }
  }, [profile?.name]);
  
  // INTERNAL STATE AND FETCHING LOGIC REMOVED
  // Props are now received from Header.jsx

  const handleEditName = () => {
    setIsEditingName(true);
    setEditedName(currentName);
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName(currentName);
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      toast.error("Name cannot be empty", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_HOST + "/auth/updateName", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ name: editedName }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update name");
      }

      // Update local state with new name
      setCurrentName(editedName);
      setIsEditingName(false);
      
      // Trigger profile refetch in Header
      if (onNameUpdate) {
        onNameUpdate();
      }
      
      toast.success("Name updated successfully", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      toast.error(err.message || "Failed to update name", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

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
        {isEditingName ? (
          <div style={{ display: "flex", gap: "8px", alignItems: "center", width: "100%" }}>
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className={classes.editInput}
              autoFocus
            />
            <button onClick={handleSaveName} className={classes.saveBtn}>
              Save
            </button>
            <button onClick={handleCancelEdit} className={classes.cancelBtn}>
              Cancel
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <span className={classes.value}>{currentName}</span>
            <button onClick={handleEditName} className={classes.editBtn}>
              Edit
            </button>
          </div>
        )}
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
            <span className={classes.value}>
              {Array.isArray(profile.departments)
                ? profile.departments.join(", ")
                : profile.departments || "N/A"}
            </span>
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