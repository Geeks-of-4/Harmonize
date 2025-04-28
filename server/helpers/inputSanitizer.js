/**
 * Input Sanitizer
 * 
 * Provides validation middleware for API requests using express-validator.
 * Validates artist names and optional parameters for concert matching.
 */

import { body } from 'express-validator';

/**
 * validateArtists
 * 
 * Express-validator middleware chain that validates:
 * 1. The presence of an 'artists' array in the request body
 * 2. Each artist name is a non-empty string
 * 3. Optional parameters (daysMaximum and rangeMaximum) are positive numbers
 * 
 * @type {Array} Array of validation middleware functions
 */
export const validateArtists = [
  // Validate the 'artists' field exists and is a non-empty array
  body('artists')
    .exists()
    .withMessage('❌ "artists" field is required')
    .isArray({ min: 1 })
    .withMessage('❌ "artists" must be a non-empty array'),

  // Validate each artist name in the array
  body('artists.*')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('❌ Each artist must be a non-empty string'),

  // Validate optional daysMaximum parameter
  body('daysMaximum')
    .optional()
    .isInt({ min: 1 })
    .withMessage('❌ "daysMaximum" must be a positive number'),

  // Validate optional rangeMaximum parameter
  body('rangeMaximum')
    .optional()
    .isInt({ min: 1 })
    .withMessage('❌ "rangeMaximum" must be a positive number'),
];
