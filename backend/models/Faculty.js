import mongoose from "mongoose";

const facschema=new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    emp_no: {type: String, required: true, unique: true},
    dept: {type: String, enum: ["CSE", "ECE", "MDS", "English"], required: true},
    role: {type: String, enum: ["hod", "faculty"], required: true},
    achievements: [{
        achievement: {type: String, required: true},
    }],
    //think abt this
    custompermissions: [
        {
            permission: {type: String, required: true}
        }
    ]
    //topics for project where to keep
});

export default mongoose.model("Faculty", facschema);