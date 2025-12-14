import mongoose from "mongoose";

const adminschema=new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    departments: {
      type: [String],
      enum: ["CSE", "ECE", "MDS"],
      required: true,
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "At least one department is required.",
      },
    },
    isStaff: {type: Boolean, default: false}
})

export default mongoose.model("Admin", adminschema);