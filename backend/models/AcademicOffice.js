import mongoose from "mongoose";

// Academic Office - read-only on marks/grades; releases approved gradings to
// students and prints them. Never edits marks.
const academicOfficeSchema=new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
});

export default mongoose.model("AcademicOffice", academicOfficeSchema);
