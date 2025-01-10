const csv = require('csv-parser');
const fs = require('fs');

/**
 * Parses a CSV file and returns rows as JSON.
 * @param {string} filePath - Path to the uploaded CSV file.
 * @returns {Promise<array>} - Parsed records.
 */
exports.parseCSV = (filePath) => {
  const records = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => records.push(row))
      .on('end', () => resolve(records))
      .on('error', (err) => reject(err));
  });
};
