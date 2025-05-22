import mongoose from "mongoose";

const staffschema=new mongoose.Schema({
    name: {type: String, required: true},
    
});

export default mongoose.model("Staff", staffschema);