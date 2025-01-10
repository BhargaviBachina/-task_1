const Joi = require('joi');

// Validation for CSV upload
exports.validateCSVUpload = (req, res, next) => {
  const schema = Joi.object({
    file: Joi.any().required().messages({
      'any.required': 'File is required'
    })
  });

  const { error } = schema.validate({file:req.file});
  if (error) {
    return res.status(400).json({ errors: error.details.map(detail => detail.message) });
  }
  next();
};

// Validation for fetching records
exports.validateFetchRecords = (req, res, next) => {
  const schema = Joi.object({
    sessionId: Joi.string().uuid().optional().messages({
      'string.uuid': 'Invalid sessionId format'
    }),
    searchField: Joi.string().optional().messages({
      'string.base': 'Search field must be a string'
    }),
    searchValue: Joi.string().optional().messages({
      'string.base': 'Search value must be a string'
    }),
    page: Joi.number().integer().min(1).optional().messages({
      'number.base': 'Page must be a positive integer',
      'number.min': 'Page must be a positive integer'
    }),
    perPage: Joi.number().integer().min(1).optional().messages({
      'number.base': 'PerPage must be a positive integer',
      'number.min': 'PerPage must be a positive integer'
    })
  });

  const { error } = schema.validate(req.query);
  if (error) {
    return res.status(400).json({ errors: error.details.map(detail => detail.message) });
  }
  next();
};
