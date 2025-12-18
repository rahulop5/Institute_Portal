import React, { useState } from "react";

import { Form, useNavigation, redirect, useNavigate } from "react-router-dom";
import styles from "../styles/ChangePassword.module.css";
import loginImage from "../../../../assets/finalimage.png";
import { toast } from "react-toastify";

import { API_HOST } from "../../../../config";

export async function action({ request }) {
  const formData = await request.formData();
  const oldPassword = formData.get("oldPassword");
  const newPassword = formData.get("password");
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(API_HOST + "/auth/changepassword", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    if (!response.ok) {
      // Handle errors from the backend
      const errorData = await response.json();
      console.error("Failed to change password:", errorData.message);
      // You should throw an error or return a message to the user
      throw new Error(errorData.message || "Failed to change password.");
    }

    toast.success("Password successfully changed!");
    // --- END: Your Backend Logic Here ---
  } catch (err) {
    console.error(err);
    // Let the router catch this error and display the ErrorPage
    throw err;
  }

  // Redirect back to the homepage on success
  return redirect("/");
}

// 3. --- YOUR COMPONENT (WITH STATE FIXES) ---
export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const navigation = useNavigation();
  const navigate = useNavigate();
  const isSubmitting = navigation.state === "submitting";

  const validate = () => {
    const newErrors = {};

    if (!oldPassword.trim()) {
      newErrors.oldPassword = "Old Password is required.";
    }
    if (!newPassword.trim()) {
      newErrors.newPassword = "New Password is required.";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "New password must be at least 6 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    if (!validate()) {
      e.preventDefault();
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <button
        type="button"
        className={styles.backButtonTop}
        onClick={() => navigate("/")}
      >
        ← Back to Home
      </button>
      <div className={styles.registerContainer}>
        <div
          className={styles.registerLeft}
          style={{ backgroundImage: `url(${loginImage})` }}
        ></div>

        <div className={styles.registerRight}>
          <h2 className={styles.registerTitle}>Change Password</h2>

          <Form onSubmit={handleSubmit} method="post" className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Old Password:</label>
              <div className={styles.passwordWrapper}>
                <input
                  name="oldPassword"
                  type={showOldPassword ? "text" : "password"}
                  placeholder="Type here..."
                  className={styles.inputField}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowOldPassword(!showOldPassword)}
                >
                  {showOldPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {errors.oldPassword && (
                <p className={styles.error}>{errors.oldPassword}</p>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label
                className={styles.inputLabel}
                style={{ marginTop: "1rem" }}
              >
                New Password:
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  name="password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Type here..."
                  className={styles.inputField}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className={styles.error}>{errors.newPassword}</p>
              )}
            </div>

            <button type="submit" className={styles.btnContinue}>
              {isSubmitting ? "Submitting..." : "Change Password"}
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}
