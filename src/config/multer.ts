import multer from "multer";

import path from "path";

import fs from "fs";

const productUploadDir = path.join(process.cwd(), "uploads/products");

const blogUploadDir = path.join(process.cwd(), "uploads/blogs");

[productUploadDir, blogUploadDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const productStorage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, productUploadDir);
  },
  filename: (_, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const blogStorage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, blogUploadDir);
  },
  filename: (_, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (
  _: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, png, gif, webp)"));
  }
};

export const productImageUpload = multer({
  storage: productStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).fields([
  { name: "mainImage", maxCount: 1 },
  { name: "productImages", maxCount: 5 },
]);

export const blogImageUpload = multer({
  storage: blogStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).fields([
  { name: "thumbImage", maxCount: 1 },
  { name: "contentImages", maxCount: 10 },
]);

export const variantImageUpload = multer({
  storage: productStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).fields([
  { name: "variantImages", maxCount: 5 },
]);

