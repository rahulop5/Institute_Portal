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

/**
 * A student's semester number (1, 2, 3...) on a given date, from their batch
 * (admission year). Monsoon of the admission year is Semester 1, the
 * following Spring Semester 2, and so on.
 * @param {string|number} batch e.g. "2022"
 * @param {Date} date
 * @returns {number|null}
 */
export function studentSemesterOn(batch, date) {
  const year = parseInt(batch, 10);
  if (!year || !date) return null;
  const d = new Date(date);
  const sem = d.getMonth() >= 6 ? 2 * (d.getFullYear() - year) + 1 : 2 * (d.getFullYear() - year);
  return sem >= 1 ? sem : null;
}

/**
 * The semester a BTP/Honors/AP project started in for this student: the
 * semester of its first evaluation, or of when the project was created if
 * none has happened yet. Evaluations carried over by a program switch keep
 * their original dates, so the numbering survives a switch.
 */
export function projectStartSemester(batch, project, evaluations = []) {
  const first = evaluations.reduce((min, ev) => (!min || ev.time < min ? ev.time : min), null);
  const started = first || project?._id?.getTimestamp?.();
  return studentSemesterOn(batch, started);
}

// When each program may start, in the student's own semesters. Both can start
// from Semester 3 at the earliest; each must finish by Semester 8, so Honors
// (4 semesters) must start by Semester 5 and BTP (2 semesters) by Semester 7.
export const PROGRAM_START_WINDOWS = {
  btp: { label: "BTP", semesters: 2, earliest: 3, latest: 7 },
  honors: { label: "Honors", semesters: 4, earliest: 3, latest: 5 },
  ap: { label: "Additional Project", semesters: 1, earliest: 5, latest: 8 },
};

/**
 * Why a program can't start in a given semester, or null if it can (or if
 * the semester is unknown, e.g. a student record without a batch).
 * @param {"btp"|"honors"|"ap"} program
 * @param {number|null} semester
 */
export function startWindowProblem(program, semester) {
  const w = PROGRAM_START_WINDOWS[program];
  if (!w || !semester) return null;
  if (semester < w.earliest) return `${w.label} can start from Semester ${w.earliest}.`;
  if (semester > w.latest) {
    return `${w.label} runs for ${w.semesters} semester${w.semesters === 1 ? "" : "s"} and must start by Semester ${w.latest}.`;
  }
  return null;
}
