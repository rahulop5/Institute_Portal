// THE one place that decides who may override what on a course grading.
// Provisional rule (open question - change it here only):
//   cutoffs : any co-teaching faculty member
//   f_to_p  : only the faculty member who owns the student's section sheet
//
// user  : { facultyId, courseFacultyIds }   (strings)
// entry : { sheetFacultyId }                (needed for f_to_p)
export function canOverride(user, action, entry = {}) {
    const me = String(user.facultyId);
    const isCourseFaculty = (user.courseFacultyIds || []).map(String).includes(me);
    switch (action) {
        case "cutoffs":
            return isCourseFaculty;
        case "f_to_p":
            return isCourseFaculty && String(entry.sheetFacultyId) === me;
        default:
            return false;
    }
}
