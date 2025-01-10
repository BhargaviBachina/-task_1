

const express = require('express');
const { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const dotenv = require('dotenv');
const db = require('../../../config/knex'); // Import knex instance
const { verifyToken } = require('../../helpers/authMiddleware'); // Import verifyToken middleware

dotenv.config(); // Load environment variables

const router = express.Router();

// Configure AWS S3 (using v3 SDK)
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Set up multer storage with multer-s3 to upload directly to S3
const upload = multer({
  //limits:{filesize:10*1024*1024},
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    key: function (req, file, cb) {
      const userId = req.userId; // Assuming JWT token has userId
      const timestamp = Date.now();
      const fileName = `${userId}_${timestamp}${path.extname(file.originalname)}`;
      cb(null, fileName); // Assign the custom filename to the file
    },
  }),
});

// Route to upload a file to S3 and save metadata in MySQL
router.post('/upload', verifyToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const userId = req.userId;

  const file = {
    user_id: userId,
    file_name: req.file.originalname,
    s3_key: req.file.key,
    file_url: req.file.location,
  };

  // Insert file metadata into MySQL
  db('files')
    .insert(file)
    .then((result) => {
      return res.json({
        message: 'File uploaded successfully',
        file: { id: result[0], ...file },  // Return inserted file metadata along with auto-generated ID
      });
    })
    .catch((err) => {
      console.error('Error inserting file metadata:', err);
      return res.status(500).json({ error: 'Failed to save file metadata' });
    });
});

// Route to list all uploaded files by the authenticated user
router.get('/', verifyToken, (req, res) => {
  const userId = req.userId;

  db('files')
    .where('user_id', userId)  // Only fetch files uploaded by the authenticated user
    .select('*')
    .then((files) => {
      return res.json({ files });
    })
    .catch((err) => {
      console.error('Error fetching files:', err);
      return res.status(500).json({ error: 'Error fetching files' });
    });
});

// Route to delete a file from S3 and remove metadata from MySQL
router.delete('/:fileId', verifyToken, (req, res) => {
  const fileId = req.params.fileId;
  const userId = req.userId;

  // Find the file in the database
  db('files')
    .where({ id: fileId, user_id: userId })  // Ensure the file belongs to the authenticated user
    .first()
    .then((file) => {
      if (!file) {
        return res.status(404).json({ error: 'File not found or you do not have permission to delete it' });
      }

      // Delete file from S3
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: file.s3_key,
      };

      s3.send(new DeleteObjectCommand(params))
        .then(() => {
          // If successful, delete file metadata from MySQL
          db('files')
            .where('id', fileId)
            .del()
            .then(() => {
              return res.json({ message: 'File deleted successfully' });
            })
            .catch((err) => {
              console.error('Error deleting file metadata from database:', err);
              return res.status(500).json({ error: 'Failed to delete file metadata from database' });
            });
        })
        .catch(() => {
          return res.status(500).json({ error: 'Error deleting file from S3' });
        });
    })
    .catch((err) => {
      console.error('Error finding file in database:', err);
      return res.status(500).json({ error: 'Error finding file' });
    });
});

module.exports = router;
