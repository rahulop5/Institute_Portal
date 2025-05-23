import mongoose from "mongoose";

const userschema=new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {
        type: String,
        enum: ["UGStudent", "Faculty", "Staff", "PrivilegedUser"],
        required: true,
    },
    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "role",
    },
    lastlogin: {type: Date, required: true},
});

export default mongoose.model("User", userschema);