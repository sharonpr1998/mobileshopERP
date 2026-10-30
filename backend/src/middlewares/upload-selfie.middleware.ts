import multer from "multer";

const uploadSelfie = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      callback(new Error("Only JPEG, PNG, or WebP images are allowed"));
      return;
    }

    callback(null, true);
  },
});

export default uploadSelfie;