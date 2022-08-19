require("dotenv").config();
const express = require("express");
const multer = require("multer");
const { MulterError } = require("multer");
const uuid = require("uuid").v4;
const {
  s3Uploadv2,
  s3Uploadsv2,
  s3Uploadv3,
  s3Uploadsv3,
} = require("./S3Service");

const app = express();

// ------------------------------------------------------------------------------
// BASIC
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// BASIC - Single File Upload
const upload = multer({ dest: "uploads/" });
app.post("/api/upload", upload.single("file"), (req, res) => {
  res.json({ status: "success" });
});

// ------------------------------------------------------------------------------
// BASIC - Multiple File Upload (here limited to 3)
const uploads = multer({ dest: "uploads/" });
app.post("/api/uploads", uploads.array("file", 3), (req, res) => {
  res.json({ status: "success" });
});

// ------------------------------------------------------------------------------
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

// ------------------------------------------------------------------------------
// INTERMEDIATE
// ------------------------------------------------------------------------------
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
const uploaduni = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1000000, files: 2 },
});
app.post("/api/custom/upload", uploaduni.array("file", 3), (req, res) => {
  res.json({ status: "success" });
});

// ------------------------------------------------------------------------------
// ERROR HANDLING
// ------------------------------------------------------------------------------
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.json({ message: "Selected File is Too Large." });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.json({ message: "Too many files selected." });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.json({
        message: "Wrong type of file selected, Image file required.",
      });
    }
  }
});

// ------------------------------------------------------------------------------
// S3 UPLOADS - version 2
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Upload Single file to S3 v2
const temp_storage = multer.memoryStorage();
// File Filter - Upload Image file only
const fileFilterS3 = (req, file, cb) => {
  // "image/jpeg" => .split("/") => ["image", "jpeg"]
  if (file.mimetype.split("/")[0] === "image") {
    cb(null, true);
  } else {
    cb(new MulterError("LIMIT_UNEXPECTED_FILE"), false);
  }
};
// File Size of 1Mb && Number of File Limit
const uploadS3 = multer({
  temp_storage,
  fileFilterS3,
  limits: { fileSize: 1000000, files: 1 },
});
app.post("/api/s3/upload", uploadS3.array("file", 1), async (req, res) => {
  const firstFile = req.files[0];
  const result = await s3Uploadv2(firstFile);
  res.json({ status: "success", result });
});

// ------------------------------------------------------------------------------
// Upload Multiple file to S3 v2 (Limit to 3 files)
const temp_storage2 = multer.memoryStorage();
const fileFilterS3_2 = (req, file, cb) => {
  if (file.mimetype.split("/")[0] === "image") {
    cb(null, true);
  } else {
    cb(new MulterError("LIMIT_UNEXPECTED_FILE"), false);
  }
};
// File Size of 1Mb && Number of File Limit
const uploadS3_2 = multer({
  temp_storage2,
  fileFilterS3_2,
  limits: { fileSize: 1000000, files: 3 },
});
app.post("/api/s3/uploads", uploadS3_2.array("file", 3), async (req, res) => {
  try {
    const results = await s3Uploadsv2(req.files);
    console.log(results);
    return res.json({ status: "success", results });
  } catch (err) {
    console.log(err);
  }
});

// ------------------------------------------------------------------------------
// S3 UPLOADS - version 3
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Upload Single file to S3 v3
const temp_storage3 = multer.memoryStorage();
// File Filter - Upload Image file only
const fileFilterS3v3 = (req, file, cb) => {
  if (file.mimetype.split("/")[0] === "image") {
    cb(null, true);
  } else {
    cb(new MulterError("LIMIT_UNEXPECTED_FILE"), false);
  }
};
const uploadS3v3 = multer({
  temp_storage3,
  fileFilterS3v3,
  limits: { fileSize: 1000000, files: 1 },
});
app.post("/api/s3v3/upload", uploadS3v3.array("file", 1), async (req, res) => {
  const firstFile = req.files[0];
  try {
    const results = await s3Uploadv3(firstFile);
    console.log(results);
    return res.json({ status: "success", results });
  } catch (err) {
    console.log(err);
  }
});

// ------------------------------------------------------------------------------
// Upload Multiple file to S3 v3 (Limit to 3 files)
const temp_storage4 = multer.memoryStorage();
// File Filter - Upload Image file only
const fileFilterS3v3_2 = (req, file, cb) => {
  if (file.mimetype.split("/")[0] === "image") {
    cb(null, true);
  } else {
    cb(new MulterError("LIMIT_UNEXPECTED_FILE"), false);
  }
};
const uploadS3v3_2 = multer({
  temp_storage4,
  fileFilterS3v3_2,
  limits: { fileSize: 1000000, files: 3 },
});
app.post(
  "/api/s3v3/uploads",
  uploadS3v3_2.array("file", 3),
  async (req, res) => {
    try {
      const results = await s3Uploadsv3(req.files);
      console.log(results);
      return res.json({ status: "success", results });
    } catch (err) {
      console.log(err);
    }
  }
);

app.listen(4000, () => console.log("Listening on PORT 4000"));
