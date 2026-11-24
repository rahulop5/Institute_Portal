// Course statistics are shown in full: every average, every comment and the writer's average
// rating next to it (the user chose transparency). Comments are shuffled, so the order they
// were submitted in doesn't line them up with students.
const shuffled = (list) => {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

// `stats` is the course-statistics payload ({avgscore, questions, min, max, feedback, responses, ...}).
export function protectCourseStats(stats) {
    return {...stats, feedback: {faculty: shuffled(stats.feedback?.faculty || []), course: shuffled(stats.feedback?.course || [])}};
}
