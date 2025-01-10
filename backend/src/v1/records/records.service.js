const db = require('../../../config/knex');
const fs = require('fs');
const csv = require('csv-parser');
const { v4: uuidv4 } = require('uuid');
const { parseCSV } = require('./records.utils');


// Helper function to sanitize field names
const sanitizeFieldName = (fieldName) => {
  // Remove leading/trailing spaces and replace spaces with underscores
  return fieldName.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
};

// Helper function to sanitize field values
const sanitizeFieldValue = (value) => {
  if (value === null || value === undefined) {
    return ''; // Or handle with a default value
  }
  
  // Remove any leading/trailing spaces
  value = value.trim();
  
  // Handle different types
  if (!isNaN(value)) {
    return parseFloat(value);  // Convert strings that are numbers into actual numbers
  }

  // Handle boolean values
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;

  // Handle dates (using a standard date format like YYYY-MM-DD)
  const date = new Date(value);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0]; // Convert date to YYYY-MM-DD
  }

  // Return the value as a string if none of the above
  return value;
};

exports.processCSV = async (file, userId) => {
  const sessionId = uuidv4();  

  const records = await parseCSV(file.path);

  // Format and sanitize records into the required structure before inserting them into the DB
  const formattedRecords = records.map((row) => {
    const sanitizedRow = {};

    // Iterate through each field in the row, sanitize it, and map to a new object
    Object.keys(row).forEach((fieldName) => {
      // Sanitize the field name
      const sanitizedFieldName = sanitizeFieldName(fieldName);
      // Sanitize the field value
      sanitizedRow[sanitizedFieldName] = sanitizeFieldValue(row[fieldName]);
    });

    return {
      user_id: userId,
      session_id: sessionId,
      timestamp: new Date(),
      data: JSON.stringify(sanitizedRow),  // Convert sanitized row to JSON string
    };
  });

  // Insert sanitized records into the database
  await db('records').insert(formattedRecords);

  // Clean up the uploaded file after processing
  fs.unlinkSync(file.path);

  return { sessionId };  // Return the sessionId for the frontend to store in localStorage
};


exports.fetchRecords = async (userId, { sessionId, searchField, searchValue, page = 1, perPage = 10 }) => {
  // If no sessionId is passed, get the most recent sessionId for the user
  if (!sessionId) {
    const latestSession = await db('records')
      .where('user_id', userId)
      .orderBy('timestamp', 'desc')  // Order by timestamp to get the most recent session
      .first();  // Fetch the latest record (session)
    
    sessionId = latestSession ? latestSession.session_id : null;  // Get the most recent sessionId
  }

  // Ensure valid pagination values
  page = parseInt(page, 10) || 1;
  perPage = parseInt(perPage, 10);

  if (isNaN(page) || page <= 0) {
    throw new Error('Page must be a positive integer');
  }
  if (isNaN(perPage) || perPage <= 0) {
    throw new Error('PerPage must be a positive integer');
  }

  const offset = (page - 1) * perPage;

  // Build the query to only fetch records for the given sessionId
  let query = db('records')
    .where('user_id', userId)
    .where('session_id', sessionId) // Ensure we filter by the current session
    .limit(perPage)
    .offset(offset)
    .select('id', 'user_id', 'session_id', 'timestamp', 'data');

  // Apply search filters if provided
  if (searchField && searchValue !== undefined) {
    searchField = searchField.trim();  // Trim searchField to avoid issues
    searchValue = searchValue.trim();  // Trim searchValue to avoid issues

    // Dynamically handle the type of searchValue to construct the query accordingly
    const isNumber = !isNaN(searchValue);
    const isBoolean = searchValue.toLowerCase() === 'true' || searchValue.toLowerCase() === 'false';

    // Escape the field name for JSON path in case it contains spaces or special characters
    const escapedSearchField = searchField.replace(/[^a-zA-Z0-9_]/g, '\\$&');  // Escape everything except alphanumeric characters and underscores

    // Handle case-insensitive comparison by converting both to lowercase
    const loweredSearchValue = searchValue.toLowerCase();  // Convert the search value to lowercase

    if (isBoolean) {
      // Handle boolean search values
      const boolValue = loweredSearchValue === 'true';
      query = query.whereRaw('LOWER(JSON_UNQUOTE(JSON_EXTRACT(data, ?))) = LOWER(?)', [`$.${escapedSearchField}`, boolValue]);
    } else if (isNumber) {
      // Handle number search values
      query = query.whereRaw('JSON_UNQUOTE(JSON_EXTRACT(data, ?)) = ?', [`$.${escapedSearchField}`, parseFloat(searchValue)]);
    } else {
      // Handle string search values (case-insensitive)
      query = query.whereRaw('LOWER(JSON_UNQUOTE(JSON_EXTRACT(data, ?))) LIKE LOWER(?)', [`$.${escapedSearchField}`, `${loweredSearchValue}%`]);
    }
  }

  // Fetch filtered records from the database (if any filter applied)
  const records = await query;

  // Get the total record count (for pagination) based on sessionId and filter (if any)
  let totalRecordsQuery = db('records')
    .where('user_id', userId)
    .where('session_id', sessionId);  // Count only the records for the current session

  // Apply search filters if provided for total record count (filtered records)
  if (searchField && searchValue !== undefined) {
    searchField = searchField.trim();
    searchValue = searchValue.trim();

    const isNumber = !isNaN(searchValue);
    const isBoolean = searchValue.toLowerCase() === 'true' || searchValue.toLowerCase() === 'false';

    const escapedSearchField = searchField.replace(/[^a-zA-Z0-9_]/g, '\\$&');  // Escape everything except alphanumeric characters and underscores

    const loweredSearchValue = searchValue.toLowerCase();  // Convert the search value to lowercase

    if (isBoolean) {
      const boolValue = loweredSearchValue === 'true';
      totalRecordsQuery = totalRecordsQuery.whereRaw('LOWER(JSON_UNQUOTE(JSON_EXTRACT(data, ?))) = LOWER(?)', [`$.${escapedSearchField}`, boolValue]);
    } else if (isNumber) {
      totalRecordsQuery = totalRecordsQuery.whereRaw('JSON_UNQUOTE(JSON_EXTRACT(data, ?)) = ?', [`$.${escapedSearchField}`, parseFloat(searchValue)]);
    } else {
      totalRecordsQuery = totalRecordsQuery.whereRaw('LOWER(JSON_UNQUOTE(JSON_EXTRACT(data, ?))) LIKE LOWER(?)', [`$.${escapedSearchField}`, `${loweredSearchValue}%`]);
    }
  }

  // Get the total count of records (filtered or unfiltered)
  const totalRecords = await totalRecordsQuery.count('id as total');

  // Calculate total pages (based on filtered or unfiltered records)
  const totalPages = Math.ceil(totalRecords[0].total / perPage);

  // Extract valid fields dynamically from the first record's data (if available)
  let validFields = [];
  if (records.length > 0) {
    try {
      let firstRecord = records[0].data;

      if (typeof firstRecord === 'string') {
        firstRecord = JSON.parse(firstRecord);  // Parse the stringified JSON
      }

      validFields = Object.keys(firstRecord);  // Get the keys (columns) from the first record
    } catch (error) {
      console.error('Error parsing data in record:', error);
      throw new Error('Invalid JSON in record data');
    }
  }

  return { 
    records,
    totalRecords: totalRecords[0].total,
    totalPages,
    currentPage: page,
    validFields 
  };
};
