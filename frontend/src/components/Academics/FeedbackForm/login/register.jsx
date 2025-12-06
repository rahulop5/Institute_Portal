import React, { useState, useEffect } from "react";
import { Form, useNavigation, useActionData } from "react-router";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import styles from "../styles/Register.module.css";
import loginImage from "../../../../assets/finalimage.png"; // Corrected path

export default function Register1() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // --- ADDED: Password state
  const [errors, setErrors] = useState({});
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const actionData = useActionData();

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [actionData]);

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    // --- ADDED: Password validation ---
    if (!password.trim()) {
      newErrors.password = "Password is required.";
    }
    // ---------------------------------

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
          style={{
            backgroundImage: `url(${loginImage})`,
          }}
        ></div>

        <div className={styles.registerRight}>
          <h2 className={styles.registerTitle}>Login</h2>

          
            <Form onSubmit={handleSubmit} method="post" className={styles.form}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Email:</label>
                <input
                  name="email"
                  type="email"
                  placeholder="Type here..."
                  className={styles.inputField}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <p className={styles.error}>{errors.email}</p>}
              </div>

              <div className={styles.inputGroup}>
                <label
                  className={styles.inputLabel}
                  style={{ marginTop: "1rem" }}
                >
                  Password:
                </label>
                <input
                  name="password"
                  type="password"
                  placeholder="Type here..."
                  className={styles.inputField}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && (
                  <p className={styles.error}>{errors.password}</p>
                )}
              </div>

              <button type="submit" className={styles.btnContinue}>
                {isSubmitting ? "Logging In" : "Log In"}
              </button>
            </Form>

            <div className={styles.divider}>
              <span className={styles.line}></span>
              <span className={styles.orText}>or</span>
              <span className={styles.line}></span>
            </div>

            <p className={styles.alreadyText}>
              Don't have an account?{" "}
              <a href="/register" className={styles.loginLink}>
                Register
              </a>
            </p>
   
        </div>
      </div>
    </div>
  );
}
