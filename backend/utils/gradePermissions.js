// THE one place that decides who may override what on a course grading.
// Provisional rule (open question - change it here only):
//   cutoffs : any co-teaching faculty member
//   f_to_p  : only the faculty member who owns the student's section sheet
//   components, submit : the course coordinator (any co-teaching faculty if none is set)
//
// user  : { facultyId, courseFacultyIds, coordinatorId }   (strings)
// entry : { sheetFacultyId }                (needed for f_to_p)
export function canOverride(user, action, entry = {}) {
    const me = String(user.facultyId);
    const isCourseFaculty = (user.courseFacultyIds || []).map(String).includes(me);
    switch (action) {
        case "cutoffs":
            return isCourseFaculty;
        case "components":
        case "submit":
            return isCourseFaculty && (!user.coordinatorId || String(user.coordinatorId) === me);
        case "f_to_p":
            return isCourseFaculty && String(entry.sheetFacultyId) === me;
        default:
            return false;
    }
}
