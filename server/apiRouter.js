// Very basic, no routing other than for the ticket master and spotify api calls.
// These can likely be merged if you want, but you'd have to modify the front end
// to send a single api request instead of 2
import express from 'express';
import apiController from './apiController.js';
import { validationResult } from 'express-validator';
import { validateArtists } from './helpers/inputSanitizer.js';

const apiRouter = express.Router();

// Route to fetch Ticket Master Data
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

// Route to fetch Spotify Image Data
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
