import mongoose from "mongoose";

const proschema=new mongoose.Schema({
    name: {type: String, required: true},
    
});

export default mongoose.model("UGProject", proschema);