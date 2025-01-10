const recordsService = require('./records.service');
const { sendResponse } = require('../../utils/responseHelper');

exports.uploadCSV = async (req, res) => {
  try {
    const { file, userId } = req; // File and userId from middleware
    if (!file) return res.status(400).json({ message: 'No file uploaded' });
    const result = await recordsService.processCSV(file, userId);
    sendResponse(res, 200, 'CSV file uploaded and records saved successfully', result);
  } catch (error) {
    sendResponse(res, 500, error.message);
  }
};

exports.fetchRecords = async (req, res) => {
  try {
    const { userId, query } = req;
    const result = await recordsService.fetchRecords(userId, query);
    sendResponse(res, 200, 'Records fetched successfully', result);
  } catch (error) {
    sendResponse(res, 500, error.message);
  }
};
