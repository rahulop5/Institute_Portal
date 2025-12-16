import React, { useState } from "react";
import styles from "../styles/OTPVerification.module.css";

export default function OTPVerification() {
  const [otp, setOtp] = useState(Array(6).fill(""));

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move to next input
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
  };

  return (
    <div className={styles.registerContainer}>
      {/* LEFT SIDE */}
      <div className={styles.leftPane}></div>

      {/* RIGHT SIDE */}
      <div className={styles.rightPane}>
        <h2 className={styles.title}>Check your inbox</h2>
        <p className={styles.subtitle}>
          Enter the 6-digit one time password sent to{" "}
          <span className={styles.emailText}>venkatrahulxyz@gmail.com</span>
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.otpContainer}>
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                className={styles.otpBox}
                value={digit}
                onChange={(e) => handleChange(e, index)}
              />
            ))}
          </div>

          <button type="submit" className={styles.btnContinue}>
            Continue
          </button>

          <p className={styles.resendText}>
            Didn’t receive a code? <span className={styles.resendLink}>Resend</span>
          </p>

          <div className={styles.divider}>
            <span className={styles.line}></span>
            <span className={styles.orText}>or</span>
            <span className={styles.line}></span>
          </div>

          <p className={styles.alreadyText}>Already registered?</p>
          <button className={styles.btnLogin}>
            Login to a different account
          </button>
        </form>
      </div>
    </div>
  );
}
