import { body, validationResult } from 'express-validator';

export const validateArtists = [
  body().isArray().withMessage('Request body must be an array'),
  body().custom((artists) => {
    if (artists.length !== 2) throw new Error('Exactly two artist names required');
    if (!artists.every(artist => typeof artist === 'string' && artist.trim().length > 0 && artist.length <= 50)) {
      throw new Error('Each artist name must be a non-empty string, max 50 chars');
    }
    return true;
  }),
];