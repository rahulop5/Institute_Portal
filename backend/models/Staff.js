import mongoose from "mongoose";

const staffschema=new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
});

export default mongoose.model("Staff", staffschema);