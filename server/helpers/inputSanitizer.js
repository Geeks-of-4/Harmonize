import { body } from 'express-validator';

export const validateArtists = [
  body('artists')
    .exists()
    .withMessage('❌ "artists" field is required')
    .isArray({ min: 1 })
    .withMessage('❌ "artists" must be a non-empty array'),
  body('artists.*')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('❌ Each artist must be a non-empty string'),
  body('daysMaximum')
    .optional()
    .isInt({ min: 1 })
    .withMessage('❌ "daysMaximum" must be a positive number'),
  body('rangeMaximum')
    .optional()
    .isInt({ min: 1 })
    .withMessage('❌ "rangeMaximum" must be a positive number'),
];
