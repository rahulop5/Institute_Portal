import mongoose from "mongoose";

const pschema=new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    permissions: [
        {
            permission: {type: String, required: true}
        }
    ],
    inheritsfrom: [
        {
            inheritprivilege: {type: String, required: true}
        }
    ]
});

export default mongoose.model("Privilege", pschema);