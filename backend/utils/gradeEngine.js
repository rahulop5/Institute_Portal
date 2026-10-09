// Pure grade-calculation functions. No DB, no I/O.
//
// Cohort rules (see plan):
//  - Only regular, present students shape T and the curve.
//  - Backlog students (isBacklog) are graded against the resulting T / cutoffs
//    and never change them. Absent rows are ignored entirely.

export const BAND_KEYS = ["O", "A", "B", "C", "D"];
export const GRADE_ORDER = ["O", "A", "B", "C", "D", "P", "F"];
export const DEFAULT_BANDS = { O: 10, A: 20, B: 30, C: 20, D: 10 };
export const BAND_LIMITS = { A: [15, 20], B: [25, 30], C: [15, 20] };

const round2 = (n) => Math.round(n * 100) / 100;

export function mean(values) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

export function stdDev(values) {
  if (values.length < 2) return 0;
  const m = mean(values);
  return Math.sqrt(values.reduce((a, b) => a + (b - m) ** 2, 0) / values.length);
}

export function totalWeight(components) {
  return round2((components || []).reduce((a, c) => a + (Number(c.weight) || 0), 0));
}

export function validateComponents(components) {
  if (!Array.isArray(components) || !components.length) return "Add at least one component";
  const keys = new Set();
  for (const c of components) {
    if (!c.key || !String(c.name || "").trim()) return "Every component needs a name";
    if (keys.has(c.key)) return "Component keys must be unique";
    keys.add(c.key);
    if (!(Number(c.rawMax) > 0)) return `"${c.name}": raw maximum must be above 0`;
    if (!(Number(c.weight) > 0)) return `"${c.name}": weight must be above 0`;
  }
  if (totalWeight(components) !== 100) return `Weights must add up to 100 (now ${totalWeight(components)})`;
  return null;
}

// Σ (raw / rawMax) × weight, out of 100. A blank mark counts as 0.
export function computeTotal(marks, components) {
  let t = 0;
  for (const c of components) {
    const raw = Number(marks?.[c.key]);
    if (Number.isFinite(raw)) t += (raw / c.rawMax) * c.weight;
  }
  return round2(t);
}

// Which components still lack a mark (null / undefined / "")
export function missingComponents(marks, components) {
  return components.filter((c) => {
    const v = marks?.[c.key];
    return v === null || v === undefined || v === "" || !Number.isFinite(Number(v));
  });
}

export function overMax(marks, components) {
  return components.filter((c) => Number(marks?.[c.key]) > c.rawMax);
}

// T = min(highest / 3, average / 2). F is strictly below T.
export function computeThreshold(totals) {
  if (!totals.length) return { T: 0, basis: "highest/3", highest: 0, average: 0 };
  const highest = Math.max(...totals);
  const average = mean(totals);
  const byHighest = highest / 3;
  const byAverage = average / 2;
  const useHighest = byHighest <= byAverage;
  return {
    T: round2(Math.min(byHighest, byAverage)),
    basis: useHighest ? "highest/3" : "avg/2",
    highest: round2(highest),
    average: round2(average),
  };
}

// Clamp requested band percentages into the allowed ranges; P is the rest.
export function normaliseBands(requested = {}) {
  const out = { ...DEFAULT_BANDS };
  for (const k of BAND_KEYS) {
    if (requested[k] === undefined || requested[k] === null || requested[k] === "") continue;
    const v = Number(requested[k]);
    if (!Number.isFinite(v)) throw new Error(`Invalid percentage for ${k}`);
    if (BAND_LIMITS[k] && (v < BAND_LIMITS[k][0] || v > BAND_LIMITS[k][1]))
      throw new Error(`${k} must be between ${BAND_LIMITS[k][0]} and ${BAND_LIMITS[k][1]}`);
    out[k] = v;
  }
  const sum = BAND_KEYS.reduce((a, k) => a + out[k], 0);
  if (sum > 100) throw new Error("Band percentages add up to more than 100");
  return out;
}

// Cutoff mark per grade: the lowest total inside that grade's cumulative share
// of the sorted non-F regular cohort. Ties at the boundary share the higher
// grade because grading uses ">= cutoff".
export function computeCutoffs(nonFTotals, bands = DEFAULT_BANDS) {
  const sorted = [...nonFTotals].sort((a, b) => b - a);
  const n = sorted.length;
  const cutoffs = {};
  if (!n) {
    for (const k of BAND_KEYS) cutoffs[k] = 0;
    return cutoffs;
  }
  let cum = 0;
  let prev = Infinity;
  for (const k of BAND_KEYS) {
    cum += bands[k];
    const count = Math.min(n, Math.max(1, Math.round((n * cum) / 100)));
    const cut = Math.min(sorted[count - 1], prev);
    cutoffs[k] = round2(cut);
    prev = cut;
  }
  return cutoffs;
}

// Apply per-grade manual overrides on top of calculated cutoffs, keeping the
// ladder non-increasing (O >= A >= B >= C >= D).
export function applyCutoffOverrides(calculated, overrides = {}) {
  const out = { ...calculated };
  for (const k of BAND_KEYS) {
    if (overrides[k] === undefined || overrides[k] === null || overrides[k] === "") continue;
    const v = Number(overrides[k]);
    if (!Number.isFinite(v) || v < 0 || v > 100) throw new Error(`Invalid cutoff for ${k}`);
    out[k] = round2(v);
  }
  for (let i = 1; i < BAND_KEYS.length; i++) {
    if (out[BAND_KEYS[i]] > out[BAND_KEYS[i - 1]])
      throw new Error(`Cutoff ${BAND_KEYS[i]} cannot be above ${BAND_KEYS[i - 1]}`);
  }
  return out;
}

export function gradeOf(total, T, cutoffs) {
  if (total < T) return "F";
  for (const k of BAND_KEYS) if (total >= cutoffs[k]) return k;
  return "P";
}

// rows: [{ id, total, isBacklog?, absent? }]
// opts: { bands, overrides, frozen: { T, cutoffs } }
//   frozen => reuse stored T and effective cutoffs, nothing is recomputed.
export function grade(rows, opts = {}) {
  const live = rows.filter((r) => !r.absent);
  const regular = live.filter((r) => !r.isBacklog);
  const backlog = live.filter((r) => r.isBacklog);

  let threshold;
  let calculated;
  let cutoffs;
  const bands = normaliseBands(opts.bands);

  if (opts.frozen) {
    threshold = { ...(opts.frozen.threshold || {}), T: opts.frozen.T };
    calculated = opts.frozen.calculated || opts.frozen.cutoffs;
    cutoffs = opts.frozen.cutoffs;
  } else {
    threshold = computeThreshold(regular.map((r) => r.total));
    const nonF = regular.filter((r) => r.total >= threshold.T).map((r) => r.total);
    calculated = computeCutoffs(nonF, bands);
    cutoffs = applyCutoffOverrides(calculated, opts.overrides);
  }

  const grades = {};
  for (const r of live) grades[r.id] = gradeOf(r.total, threshold.T, cutoffs);

  const counts = Object.fromEntries(GRADE_ORDER.map((g) => [g, 0]));
  for (const r of regular) counts[grades[r.id]]++;
  const backlogCounts = Object.fromEntries(GRADE_ORDER.map((g) => [g, 0]));
  for (const r of backlog) backlogCounts[grades[r.id]]++;

  return {
    bands,
    threshold,
    calculated,
    cutoffs,
    grades,
    counts,
    backlogCounts,
    cohort: { regular: regular.length, backlog: backlog.length, nonF: regular.filter((r) => grades[r.id] !== "F").length },
    mean: round2(mean(regular.map((r) => r.total))),
  };
}

// A manual F -> P (or other) override wins over the computed grade.
export function finalGradeOf(computedGrade, overrideGrade) {
  return overrideGrade || computedGrade;
}

// Re-exam preview. `rows` must already carry the NEW totals.
//   frozen    : only reexamIds are re-graded against `previous` T/cutoffs
//   recompute : whole cohort re-run, anyone whose grade moves is listed
// `previousGrades` is { id: grade } of the last approved/released version.
export function reexamPreview({ rows, reexamIds, previous, previousGrades, bands, overrides }) {
  const ids = new Set(reexamIds.map(String));
  const frozenRes = grade(rows.filter((r) => ids.has(String(r.id))), {
    frozen: { T: previous.threshold.T, threshold: previous.threshold, cutoffs: previous.cutoffs, calculated: previous.calculated },
  });
  const recomputeRes = grade(rows, { bands, overrides });

  const diff = (nextGrades) => {
    const changes = [];
    let unchanged = 0;
    for (const id of Object.keys(nextGrades)) {
      const from = previousGrades[id];
      const to = nextGrades[id];
      if (from === undefined || from === to) unchanged++;
      else changes.push({ id, from, to });
    }
    return { changes, unchanged };
  };

  return {
    frozen: { result: frozenRes, ...diff(frozenRes.grades) },
    recompute: { result: recomputeRes, ...diff(recomputeRes.grades) },
  };
}

// Per-group mean / σ (sections, components) — for comparison tables.
export function groupStats(rows, keyFn, valueFn = (r) => r.total) {
  const groups = {};
  for (const r of rows) (groups[keyFn(r)] ||= []).push(valueFn(r));
  return Object.fromEntries(
    Object.entries(groups).map(([k, v]) => [k, { n: v.length, mean: round2(mean(v)), sd: round2(stdDev(v)) }])
  );
}

// Does the latest attempt per (student, courseKey) leave an open backlog?
// attempts: [{ student, courseKey, semester, createdAt, grade }]
export function semesterRank(s) {
  const m = /^([MS])(\d{2})$/.exec(s || "");
  return m ? Number(m[2]) * 2 + (m[1] === "M" ? 1 : 0) : 0; // S25 (Jan) < M25 (Aug) < S26
}

export function latestAttempts(attempts) {
  const semRank = semesterRank;
  const best = new Map();
  for (const a of attempts) {
    const key = `${a.student}|${a.courseKey}`;
    const cur = best.get(key);
    // order: semester, then amendment version, then insertion time
    const score = (x) => [semRank(x.semester), x.version || 0, new Date(x.createdAt || 0).getTime()];
    const newer = (x, y) => {
      const a1 = score(x), b1 = score(y);
      for (let i = 0; i < 3; i++) if (a1[i] !== b1[i]) return a1[i] > b1[i];
      return false;
    };
    if (!cur || newer(a, cur)) best.set(key, a);
  }
  return [...best.values()];
}

export function openBacklogsFrom(attempts) {
  return latestAttempts(attempts).filter((a) => a.grade === "F");
}
