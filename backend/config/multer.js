import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath = path.join("uploads", "csvs");

// Ensure folder exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const csvFilter = (req, file, cb) => {
  if (file.mimetype === "text/csv" || /\.csv$/i.test(file.originalname)) {
    cb(null, true);
  } else {
    cb(Object.assign(new Error("Only CSV files are allowed!"), { status: 400 }), false);
  }
};

//only supports csv files btw
// One CSV of at most 5 MB per request, and no extra form fields beyond a handful.
const upload = multer({ storage, fileFilter: csvFilter, limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 20, fieldSize: 100 * 1024 } });

export default upload;
