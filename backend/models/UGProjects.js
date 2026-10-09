import mongoose from "mongoose";

// UG Projects office (formerly "Staff") - first approver for BTP/Honors
// program change requests. Keeps the old "staffs" collection so existing
// staff records carry over.
const ugprojectsschema=new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
}, { collection: "staffs" });

export default mongoose.model("UGProjects", ugprojectsschema);
