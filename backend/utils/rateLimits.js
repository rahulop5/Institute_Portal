import rateLimit from "express-rate-limit";
import {normEmail} from "./security.js";

// Behind a reverse proxy (nginx) set TRUST_PROXY=1 so req.ip is the real client. Without it,
// a request that arrives with X-Forwarded-For would make every client look like the proxy and
// share one IP bucket, so the per-IP limits skip such requests; the per-email limits still apply.
const trusted = !!process.env.TRUST_PROXY;
const skipUntrustedProxy = (req) => !trusted && !!req.headers["x-forwarded-for"];
const tooMany = (message) => (req, res) => res.status(429).json({message});
const common = {standardHeaders: "draft-7", legacyHeaders: false, validate: {xForwardedForHeader: false}};
const emailKey = (req) => `e:${normEmail(req.body?.email) || "?"}`;

// Failed logins per account: stops password guessing on one user whatever IP it comes from.
const loginPerEmail = rateLimit({
    ...common, windowMs: 15 * 60 * 1000, limit: 10, skipSuccessfulRequests: true, keyGenerator: emailKey,
    handler: tooMany("Too many failed attempts for this account. Try again in 15 minutes."),
});
// Failed logins per IP: stops spraying one password across many accounts.
const loginPerIp = rateLimit({
    ...common, windowMs: 15 * 60 * 1000, limit: 50, skipSuccessfulRequests: true, skip: skipUntrustedProxy,
    keyGenerator: (req) => `i:${req.ip}`,
    handler: tooMany("Too many failed attempts. Try again in 15 minutes."),
});
export const loginLimiter = [loginPerIp, loginPerEmail];

// OTP requests and checks per IP (the per-account limits live in the database).
export const otpLimiter = rateLimit({
    ...common, windowMs: 15 * 60 * 1000, limit: 30, skip: skipUntrustedProxy,
    keyGenerator: (req) => `i:${req.ip}`,
    handler: tooMany("Too many requests. Try again in 15 minutes."),
});
