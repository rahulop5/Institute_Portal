import mongoose from "mongoose";

const stuschema=new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    dept: {type: String, enum: ["CSE", "ECE", "MDS"], required: true},
    batch: {type: String, required: true},//2022, 2023 etc the year they joined
    rollno: {type: String, required: true, unique: true},
    phone: {type: String, required: false},
    ug: {type: String, required: true},
});

export default mongoose.model("UGStudentHonors", stuschema);