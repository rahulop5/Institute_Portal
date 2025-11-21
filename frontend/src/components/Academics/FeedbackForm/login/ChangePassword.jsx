import React, { useState } from "react";

import { Form, useNavigation, redirect } from "react-router-dom";
import styles from "../styles/ChangePassword.module.css";
import loginImage from "../../../../assets/finalimage.png";

export async function action({ request }) {
  const formData = await request.formData();
  const oldPassword = formData.get("oldPassword");
  const newPassword = formData.get("password");
  const token = localStorage.getItem("token");

  try {
    const response = await fetch("http://localhost:3000/auth/changepassword", {
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

    alert("Password changed successfully!");
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

  const [errors, setErrors] = useState({});
  const navigation = useNavigation();
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
              <input
                name="oldPassword"
                type="password"
                placeholder="Type here..."
                className={styles.inputField}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
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
              <input
                name="password"
                type="password"
                placeholder="Type here..."
                className={styles.inputField}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
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
