import mongoose from "mongoose";

const puschema=new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    privilege: {type: mongoose.Schema.Types.ObjectId, ref: "Privilege", required: true},
    custompermissions: [
        {
            permission: {type: String, required: true}
        }
    ]
});

export default mongoose.model("PrivilegedUser", puschema);