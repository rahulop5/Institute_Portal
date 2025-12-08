import mongoose from "mongoose";

const adminschema=new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    departments: {type: String, enum: ["CSE", "ECE", "MDS"], required: true },
    isStaff: {type: Boolean, default: false}
})

export default mongoose.model("Admin", adminschema);