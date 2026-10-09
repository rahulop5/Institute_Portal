import nodemailer from "nodemailer";

let transporter = null;
// Lazy so env vars are read after dotenv has loaded, and the transport is shared by every mailer.
export const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  }
  return transporter;
};

export const mailConfigured = () => !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);

export const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
