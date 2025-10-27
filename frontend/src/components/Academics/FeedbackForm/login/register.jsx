import React, { useState } from "react";
import styles from "../styles/Register.module.css";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    // Email validation (basic regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Password validation
    if (!password.trim()) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    // Confirm password validation
    if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // returns true if valid
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
     
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerLeft}></div>

      <div className={styles.registerRight}>
        <h2 className={styles.registerTitle}>Register</h2>

        <form onSubmit={handleSubmit}>
          <label className={styles.inputLabel}>Email:</label>
          <input
            type="email"
            placeholder="Type here..."
            className={styles.inputField}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <p className={styles.error}>{errors.email}</p>}

          <label className={styles.inputLabel}>Password:</label>
          <input
            type="password"
            placeholder="Type here..."
            className={styles.inputField}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <p className={styles.error}>{errors.password}</p>}

          <input
            type="password"
            placeholder="Retype here..."
            className={styles.inputField}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {errors.confirmPassword && (
            <p className={styles.error}>{errors.confirmPassword}</p>
          )}

          <button type="submit" className={styles.btnContinue}>
            Continue
          </button>
        </form>

        <div className={styles.divider}>
          <span className={styles.line}></span>
          <span className={styles.orText}>or</span>
          <span className={styles.line}></span>
        </div>

        <p className={styles.alreadyText}>Already registered?</p>
        <button className={styles.btnLogin}>
          Login to a different account
        </button>
      </div>
    </div>
  );
}
