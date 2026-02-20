/**
 * Semester Utility Functions
 * 
 * Semester codes follow the format: [M|S][YY]
 *   M = Monsoon (Jul–Dec), S = Spring (Jan–Jun)
 *   YY = last 2 digits of the year
 * 
 * Examples: M25 = Monsoon 2025, S26 = Spring 2026
 */

/**
 * Returns the current semester code based on the server date.
 * Jan–Jun → Spring (S), Jul–Dec → Monsoon (M)
 * @returns {string} e.g. "S26", "M26"
 */
export function getCurrentSemester() {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-indexed
  const year = now.getFullYear() % 100; // last 2 digits
  const yy = String(year).padStart(2, "0");

  if (month >= 1 && month <= 6) {
    return `S${yy}`; // Spring
  } else {
    return `M${yy}`; // Monsoon
  }
}

/**
 * Returns the previous semester code.
 * Previous of S26 → M25, Previous of M25 → S25
 * @param {string} [code] - optional semester code; defaults to current
 * @returns {string}
 */
export function getPreviousSemester(code) {
  if (!code) code = getCurrentSemester();

  const type = code.charAt(0); // "M" or "S"
  const yy = parseInt(code.substring(1), 10);

  if (type === "S") {
    // Previous of Spring YY → Monsoon (YY - 1)
    return `M${String(yy - 1).padStart(2, "0")}`;
  } else {
    // Previous of Monsoon YY → Spring YY
    return `S${String(yy).padStart(2, "0")}`;
  }
}

/**
 * Validates that a string is a valid semester code.
 * @param {string} code
 * @returns {boolean}
 */
export function isValidSemesterCode(code) {
  return /^[MS]\d{2}$/.test(code);
}

/**
 * Returns a human-readable label for a semester code.
 * @param {string} code e.g. "S26"
 * @returns {string} e.g. "Spring 2026"
 */
export function semesterLabel(code) {
  if (!isValidSemesterCode(code)) return code;
  const type = code.charAt(0) === "S" ? "Spring" : "Monsoon";
  const year = 2000 + parseInt(code.substring(1), 10);
  return `${type} ${year}`;
}
