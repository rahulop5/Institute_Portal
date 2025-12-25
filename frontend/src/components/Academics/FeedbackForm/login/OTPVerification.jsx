import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../styles/OTPVerification.module.css";
import { API_HOST } from "../../../../config";
import { toast } from "react-toastify";

export default function OTPVerification() {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "your email";
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (!location.state?.email) {
       // redirect if no email (optional, depends on flow)
       // navigate("/auth?mode=login");
    }
  }, [location, navigate]);

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

  const handleResend = async () => {
      try {
        const response = await fetch(`${API_HOST}/auth/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        
        if (!response.ok) {
            const data = await response.json();
            if (response.status === 429) {
                 toast.error("Limit exceeded. Try again tomorrow.");
            } else {
                 toast.error(data.message || "Failed to resend OTP.");
            }
            return;
        }
        toast.success("OTP resent successfully!");
      } catch (err) {
        toast.error("Network error.");
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
        toast.error("Please enter a 6-digit OTP.");
        return;
    }
    
    setIsSubmitting(true);
    try {
        const response = await fetch(`${API_HOST}/auth/verify-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp: enteredOtp }),
        });
        const data = await response.json();

        if (!response.ok) {
            // User requested: "if the otp entered is wrong dont take the user to error page use toast to show the error"
            toast.error(data.message || "Invalid OTP");
            setIsSubmitting(false);
            return;
        }

        toast.success("OTP Verified!");
        navigate("/reset-password", { state: { email, otp: enteredOtp } });

    } catch (err) {
        console.error(err);
        toast.error("Verification failed. Please try again.");
        setIsSubmitting(false);
    }
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
          <span className={styles.emailText}>{email}</span>
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

          <button type="submit" className={styles.btnContinue} disabled={isSubmitting}>
            {isSubmitting ? "Verifying..." : "Continue"}
          </button>

          <p className={styles.resendText}>
            Didn’t receive a code? <span className={styles.resendLink} onClick={handleResend} style={{cursor: 'pointer'}}>Resend</span>
          </p>

          <div className={styles.divider}>
            <span className={styles.line}></span>
            <span className={styles.orText}>or</span>
            <span className={styles.line}></span>
          </div>

          <p className={styles.alreadyText}>Already registered?</p>
          <button type="button" className={styles.btnLogin} onClick={() => navigate("/auth")}>
            Login to a different account
          </button>
        </form>
      </div>
    </div>
  );
}
