// This DB serves no other purpose than to hold the API keys from spotify.
// Oddly enough, all spotify keys expire an hour after creation, so we use
// the key for an hour by storing it in the database, and then if it expires,
// we make a new one and replace the old one in the DB.
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🛠️ Initializing MongoDB connection...');

const mongoURI =
  process.env.NODE_ENV === 'production'
    ? process.env.MONGO_URI_PROD // Use Cloud DB in production
    : process.env.MONGO_URI_DEV; // Use Local DB in development

console.log(`🛠️ Connecting to MongoDB at: ${mongoURI}`);

// Connect to MongoDB
mongoose
  .connect(mongoURI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((error) => console.error('❌ MongoDB connection error:', error));

// Define a schema for Spotify token data
const TokenSchema = new mongoose.Schema({
  access_token: String,
  token_type: String,
  expires_in: Number,
  token_expiry: Number,
});

console.log('📜 Token schema defined.');

const TicketmasterCacheSchema = new mongoose.Schema({
  artistName: { type: String, required: true, unique: true },
  events: { type: Array, required: true }, // Array of event objects
  status: { type: String, enum: ['success', 'empty_response', 'api_error'], required: true },
  lastUpdated: { type: Date, default: Date.now, expires: '30d' }, // Auto-delete after 30 days
});

console.log('🎫 Ticket Master schema defined.');

const Token = mongoose.model('Token', TokenSchema);
const TicketmasterCache = mongoose.model('TicketmasterCache', TicketmasterCacheSchema);


export {Token, TicketmasterCache};
