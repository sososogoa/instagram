const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// 파일 저장 경로 및 파일명 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const filename = uuidv4() + path.extname(file.originalname);
    cb(null, filename);
  },
});

const upload = multer({ storage });

// uploads 폴더 생성
const dir = './uploads';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

// 파일 업로드
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    res.status(200).json({ filePath: `/uploads/${req.file.filename}` });
  } catch (error) {
    res.status(400).send('Error uploading file');
  }
});

// 파일 조회
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

module.exports = { router, upload };
