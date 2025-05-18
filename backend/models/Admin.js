import mongoose from "mongoose";

const admschema=new mongoose.Schema({
    name: {type: String, required: false},
    email: {type: String, required: true},
    password: {type: String, required: true},
});

export default mongoose.model("AcadOffice", admschema);