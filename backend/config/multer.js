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

const upload = multer({ storage: storage });

export default upload;