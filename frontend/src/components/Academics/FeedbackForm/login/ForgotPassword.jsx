import React, { useState } from "react";
import { Form, useNavigate, useNavigation } from "react-router-dom";
import styles from "../styles/ChangePassword.module.css"; // Reusing styles
import loginImage from "../../../../assets/finalimage.png";
import { toast } from "react-toastify";
import { API_HOST } from "../../../../config";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const validate = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response = await fetch(`${API_HOST}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
           // Specific requirement: "if limit exceeded make the frontend show that the limit has been exceeded try again tomorrow"
           setErrors({ final: "Limit exceeded. Try again tomorrow." });
           toast.error("Limit exceeded. Try again tomorrow.");
        } else {
           setErrors({ final: data.message || "Something went wrong." });
           toast.error(data.message || "Failed to send OTP.");
        }
        return;
      }

      toast.success("OTP sent successfully!");
      navigate("/verify-otp", { state: { email } }); 
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again.");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <button
        type="button"
        className={styles.backButtonTop}
        onClick={() => navigate("/auth?mode=login")}
      >
        ← Back to Login
      </button>
      <div className={styles.registerContainer}>
        <div
          className={styles.registerLeft}
          style={{ backgroundImage: `url(${loginImage})` }}
        ></div>

        <div className={styles.registerRight}>
          <h2 className={styles.registerTitle}>Forgot Password</h2>
          <p className={styles.subtitle} style={{marginBottom: '1rem', textAlign: 'center', color: '#666'}}>
            Enter your email to receive an OTP.
          </p>

          <Form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Email Address:</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email..."
                className={styles.inputField}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <p className={styles.error}>{errors.email}</p>}
            </div>

            {errors.final && <p className={styles.error} style={{marginTop: '1rem', textAlign: 'center'}}>{errors.final}</p>}

            <button type="submit" className={styles.btnContinue}>
              {isSubmitting ? "Sending..." : "Send OTP"}
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}
