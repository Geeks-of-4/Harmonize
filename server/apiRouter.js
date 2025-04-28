/**
 * API Router
 * 
 * Defines the routes for the Harmonize API endpoints.
 * Currently handles two main routes:
 * 1. Ticketmaster data fetching and matching
 * 2. Spotify artist image fetching
 * 
 * Note: These routes could potentially be merged into a single endpoint
 * if the frontend is modified to send a single API request instead of two.
 */

import express from 'express';
import apiController from './apiController.js';
import { validationResult } from 'express-validator';
import { validateArtists } from './helpers/inputSanitizer.js';

const apiRouter = express.Router();

/**
 * Ticketmaster Data Route
 * 
 * POST /api/TM
 * Fetches concert data from Ticketmaster and finds matching events
 * 
 * Middleware Chain:
 * 1. validateArtists - Validates artist input
 * 2. Request validation - Checks for validation errors
 * 3. getTicketMasterData - Fetches concert data
 * 4. getMatchingEvents - Finds matching events
 */
apiRouter.post(
  '/TM',
  validateArtists,
  (req, res, next) => {
    console.log('📡 Incoming POST request!');
    console.log('Sanitized Request Body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  apiController.getTicketMasterData,
  apiController.getMatchingEvents
);

/**
 * Spotify Image Route
 * 
 * POST /api/spotify
 * Fetches artist images from Spotify
 * 
 * Middleware Chain:
 * 1. validateArtists - Validates artist input
 * 2. Request validation - Checks for validation errors
 * 3. getSpotifyImageData - Fetches artist images
 */
apiRouter.post(
  '/spotify',
  validateArtists,
  (req, res, next) => {
    console.log('📡 Incoming POST request!');
    console.log('Sanitized Request Body:', req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
  apiController.getSpotifyImageData
);

console.log('✅ API Router setup complete.');

export default apiRouter;
