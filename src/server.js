import express from 'express';
import cors from 'cors';
import multer from 'multer';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';

const app = express();

app.use('*', cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const PORT = process.env.PORT || 4000;

app.get('/ping', (req, res) => {
  res.send("Pong");
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

const upload = multer({
  storage
});

app.post('/upload', upload.single('file'), (req, res, next) => {
  console.log(req.file);
  res.send('OK');
});

app.get('/video-stream', (req, res) => {
  const videoPath = path.join(process.cwd(), 'uploads', '/Huong Ngoc Lan.mp4');
  const stats = fs.statSync(videoPath);
  const { size, } = stats;
  const range = req.headers.range
  console.log('range|', range);
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10)
    const end = parts[1] 
      ? parseInt(parts[1], 10)
      : size - 1;

    const chunkSize = (end - start) + 1;
    const file = fs.createReadStream(videoPath, {start, end});
    const head = {
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': size,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(200, head)
    fs.createReadStream(videoPath).pipe(res)
  }
});

app.listen(PORT, () => {
  console.log('Server is starting at port:', PORT);
  console.log(path.join(process.cwd(), 'uploads', '/Giatdo.mp4'));
});