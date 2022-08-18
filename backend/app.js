const express = require("express");
const { MulterError } = require("multer");
const multer = require("multer");
const uuid = require("uuid").v4;
const app = express();

// --------------
// BASIC
// --------------
// BASIC - Single File Upload
const upload = multer({ dest: "uploads/" });
app.post("/api/upload", upload.single("file"), (req, res) => {
  res.json({ status: "success" });
});

// BASIC - Multiple File Upload (here limited to 3)
const uploads = multer({ dest: "uploads/" });
app.post("/api/uploads", uploads.array("file", 3), (req, res) => {
  res.json({ status: "success" });
});

// BASIC - Multiple Fild File Upload (here limited to 3)
const uploadFile = multer({ dest: "uploads/" });
const multiUpload = uploadFile.fields([
  { name: "avatar", maxCount: 1 },
  { name: "resume", maxCount: 1 },
]);
app.post("/api/multiupload", multiUpload, (req, res) => {
  console.log(req.files);
  res.json({ status: "success" });
});

// --------------
// INTERMEDIATE
// --------------
// Custom Filename -  Multiple File Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const { originalname } = file;
    cb(null, `${uuid()}-${originalname}`);
  },
});
// File Filter - Upload Image file only
const fileFilter = (req, file, cb) => {
  // "image/jpeg" => .split("/") => ["image", "jpeg"]
  if (file.mimetype.split("/")[0] === "image") {
    cb(null, true);
  } else {
    cb(new MulterError("LIMIT_UNEXPECTED_FILE"), false);
  }
};
// File Size of 1Mb && Number of File Limit
const uploaduni = multer({ storage, fileFilter, limits: { fileSize: 1000000, files: 2 } });
app.post("/api/custom/upload", uploaduni.array("file", 3), (req, res) => {
  res.json({ status: "success" });
});

// --------------
// ERROR HANDLING
// --------------
app.use((error, req, res, next) => {
    if(error instanceof multer.MulterError) {
        if(error.code === "LIMIT_FILE_SIZE") {
            return res.json({ message: "Selected File is Too Large."})
        }
        if(error.code === "LIMIT_FILE_COUNT") {
            return res.json({ message: "Too many files selected."})
        }
        if(error.code === "LIMIT_UNEXPECTED_FILE") {
            return res.json({ message: "Wrong type of file selected, Image file required."})
        }
    }
});


app.listen(4000, () => console.log("Listening on PORT 4000"));
