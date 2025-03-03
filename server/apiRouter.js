import express from 'express';
import apiController from './apiController.js';

const apiRouter = express.Router();

// Route to fetch GitHub trending repositories
apiRouter.post('/', (req, res, next) => {
    console.log('📡 Incoming POST request!');
    next();
  },
  apiController.getTicketMasterData, 
  (req, res) => {
    console.log('✨ Sending Ticket Master Trending');
    return res.status(200).json(res.locals);
  }
);

console.log('✅ API Router setup complete.');

export default apiRouter;
