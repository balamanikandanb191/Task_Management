// middleware/validate.middleware.js — express-validator result checker
const { validationResult } = require('express-validator');
const { sendError } = require('../utils/helpers');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => e.msg).join(', ');
    return sendError(res, messages, 422);
  }
  next();
};

module.exports = validate;
