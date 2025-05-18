import mongoose from "mongoose";

const facschema=new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    dept: {type: String, enum: ["CSE", "ECE", "MDS"], required: true},
    role: {type: String, enum: ["hod", "professor"], required: true},
    //details and achievements
    achievements: [{
        achievement: {type: String, required: true},
    }]
});

export default mongoose.model("Faculty", facschema);