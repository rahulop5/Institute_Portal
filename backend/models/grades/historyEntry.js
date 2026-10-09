import mongoose from "mongoose";

// Same shape as ProgramChangeRequest.history: {role, email, action, remark, at}
export const historySchema = new mongoose.Schema({
    role: {type: String, enum: ["Student", "Faculty", "AcademicOffice", "System"], required: true},
    email: {type: String},
    action: {type: String, required: true},
    remark: {type: String},
    at: {type: Date, default: Date.now},
}, {_id: false});
