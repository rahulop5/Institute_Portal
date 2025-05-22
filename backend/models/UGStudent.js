import mongoose from "mongoose";

const stuschema=new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    dept: {type: String, enum: ["CSE", "ECE", "MDS"], required: true},
    rollno: {type: String, required: true, unique: true},
    phone: {type: String, required: false},
    ug: {type: String, required: true},
    section: {type: String, required: false},
    bin: {type: Number, required: false},
});

export default mongoose.model("UGStudent", stuschema);