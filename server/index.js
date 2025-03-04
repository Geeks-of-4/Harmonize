// Ultra basic, the backend ONLY support post requests to localhost:9001/api/...
import express from 'express';
import cors from 'cors';
import apiRouter from './apiRouter.js';

const app = express();
const PORT = process.env.PORT || 9001;
app.use(express.json()); // Parse JSON request bodies

// Allow cross-origin requests 
// *THIS IS THE REASON THE SERVER EXISTS TO BEGIN WITH
app.use(cors()); 

// Handle requests to API
app.use('/api', apiRouter);

// catch-all route handler for any requests to an unknown route
app.use((req, res) => {
  console.log(`😖 404 Response Sent! (${req.method} ${req.originalUrl})`);
  res.status(404).send('404 Page Not Found');
});

// global error handler
app.use((err, req, res, next) => {
  console.log('❌ Error triggered:', err.message || 'Unknown error');
  const defaultError = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { err: 'An error occurred' },
  };
  const errorObj = Object.assign(defaultError, err);
  console.log('🚨 Error log:', errorObj.log);
  return res.status(errorObj.status).send(errorObj.message);
});

// port listening to start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});





