import React, { useState } from "react";
import { Form, useNavigate, useLocation } from "react-router-dom";
import styles from "../styles/ChangePassword.module.css";
import loginImage from "../../../../assets/finalimage.png";
import { toast } from "react-toastify";
import { API_HOST } from "../../../../config";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const userData = location.state; // Expecting { email, otp } from OTP page

  // If accessed directly without state, redirect to login
  React.useEffect(() => {
    if (!userData || !userData.email || !userData.otp) {
        navigate("/auth?mode=login");
    }
  }, [userData, navigate]);

  const validate = () => {
    const newErrors = {};

    if (!newPassword) {
      newErrors.newPassword = "New Password is required.";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters.";
    }

    if (newPassword !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response = await fetch(`${API_HOST}/auth/reset-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: userData.email,
            otp: userData.otp,
            newPassword: newPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to reset password.");
        return;
      }

      toast.success("Password reset successfully! Please login.");
      navigate("/auth?mode=login"); 
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again.");
    }
  };

  if (!userData) return null;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.registerContainer}>
        <div
          className={styles.registerLeft}
          style={{ backgroundImage: `url(${loginImage})` }}
        ></div>

        <div className={styles.registerRight}>
          <h2 className={styles.registerTitle}>Reset Password</h2>

          <Form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>New Password:</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showNewPassword ? "text" : "password"}
                  className={styles.inputField}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                   {showNewPassword ? "👁️" : "🙈"}
                </button>
              </div>
              {errors.newPassword && (
                <p className={styles.error}>{errors.newPassword}</p>
              )}
            </div>

            <div className={styles.inputGroup} style={{marginTop: '1rem'}}>
              <label className={styles.inputLabel}>Confirm New Password:</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className={styles.inputField}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                   {showConfirmPassword ? "👁️" : "🙈"}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className={styles.error}>{errors.confirmPassword}</p>
              )}
            </div>

            <button type="submit" className={styles.btnContinue}>
              Reset Password
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}
