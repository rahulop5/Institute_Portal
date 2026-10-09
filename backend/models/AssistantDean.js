import mongoose from "mongoose";

// Assistant Dean Academics - second approver for BTP/Honors program change
// requests, after UG Projects and before the student's guide.
const assistantdeanschema=new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
});

export default mongoose.model("AssistantDean", assistantdeanschema);
