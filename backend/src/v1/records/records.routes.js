const express = require('express');
const multer = require('multer');
const { uploadCSV, fetchRecords } = require('./records.controller');
const { validateCSVUpload, validateFetchRecords } = require('./validations/records.validation');
const { verifyToken } = require('../../helpers/authMiddleware');

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.post('/upload-csv', verifyToken, upload.single('file'), validateCSVUpload, uploadCSV);
router.get('/records', verifyToken, validateFetchRecords, fetchRecords);

module.exports = router;

