/**
 * Main Server Entry Point
 * 
 * Sets up and configures the Express server for the Harmonize application.
 * Handles middleware setup, CORS configuration, and error handling.
 * 
 * The server only supports POST requests to localhost:9001/api/...
 */

import express from 'express';
import cors from 'cors';
import apiRouter from './apiRouter.js';

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 9001;

// Middleware to parse JSON request bodies
app.use(express.json());

/**
 * CORS Configuration
 * Defines allowed origins for cross-origin requests
 */
const allowedOrigins = [
  'http://127.0.0.1:5173', // ✅ Localhost for Vite Dev Server
  'http://localhost:5173', // ✅ Localhost for Dev
  'https://harmonize.ataraxi.st', // ✅ Production Domain
];

// Configure CORS middleware with custom origin validation
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`🚫 CORS Policy Blocked: ${origin} is not allowed`));
      }
    },
    credentials: true,
  })
);

// Mount API routes
app.use(apiRouter);

/**
 * 404 Handler
 * Catches any requests to unknown routes
 */
app.use((req, res) => {
  console.log(`😖 404 Response Sent! (${req.method} ${req.originalUrl})`);
  res.status(404).send('404 Page Not Found');
});

/**
 * Global Error Handler
 * Catches and processes any unhandled errors in the application
 */
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

/**
 * Start Server
 * Initializes the server on the specified port
 */
app
  .listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  })
  .on('error', (err) => {
    console.error('❌ Server error:', err);
  });
