// Very basic, no routing other than for the ticket master and spotify api calls. 
// These can likely be merged if you want, but you'd have to modify the front end 
// to send a single api request instead of 2
import express from 'express';
import apiController from './apiController.js';

const apiRouter = express.Router();

// Route to fetch Ticket Master Data
apiRouter.post(
  '/TM',
  (req, res, next) => {
    console.log('📡 Incoming POST request!');
    next();
  },
  apiController.getTicketMasterData,
  (req, res) => {
    console.log('✨ Sending Ticket Master Events');
    return res.status(200).json(res.locals);
  }
);

// Route to fetch Spotify Image Data
apiRouter.post(
  '/spotify',
  (req, res, next) => {
    console.log('📡 Incoming POST request!');
    next();
  },
  apiController.getSpotifyImageData,
  (req, res) => {
    console.log('✨ Sending Spotify Images');
    return res.status(200).json(res.locals);
  }
);

console.log('✅ API Router setup complete.');

export default apiRouter;
