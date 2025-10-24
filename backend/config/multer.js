import multer from "multer";
import fs from "fs";

if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads", { recursive: true });
}

const storage = multer.diskStorage({
  destination: "./uploads",
  filename: function (req, file, cb) {
    cb(null, "bins.csv");
  },
});
export const upload = multer({ storage: storage });

const storagefeedback = multer.diskStorage({
  destination: "./uploads",
  filename: function (req, file, cb) {
    cb(null, "students.csv");
  },
});

export const uploadstudents=multer({ storage: storagefeedback });