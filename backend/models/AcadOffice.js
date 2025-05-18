import mongoose from "mongoose";

const acschema=new mongoose.Schema({
    name: {type: String, required: false},
    email: {type: String, required: true},    
    password: {type: String, required: true},
    role: {type: String, required: false},
});

export default mongoose.model("AcadOffice", acschema);