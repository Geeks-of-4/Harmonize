// Ultra basic, the backend ONLY support post requests to localhost:9001/api/...
import express from 'express';
import cors from 'cors';
import apiRouter from './apiRouter.js';

const app = express();
const PORT = process.env.PORT || 9001;
app.use(express.json()); // Parse JSON request bodies

// Allow cross-origin requests
app.use(
  cors({
    origin: 'https://harmonize.ataraxi.st',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  })
);

// Handle requests to API
app.use((req, res, next) => {
  console.log(`📡 Incoming request: ${req.method} ${req.url}`);
  console.log('📥 Request headers:', req.headers);
  console.log('📤 Request body:', req.body);
  apiRouter;
});

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
app
  .listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  })
  .on('error', (err) => {
    console.error('❌ Server error:', err);
  });

//TODO: Remove this after shit is working on railway.
// Global Error Logging
process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
});
