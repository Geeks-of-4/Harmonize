// This DB serves no other purpose than to hold the API keys from spotify. 
// Oddly enough, all spotify keys expire an hour after creation, so we use 
// the key for an hour by storing it in the database, and then if it expires, 
// we make a new one and replace the old one in the DB.  
import mongoose from 'mongoose';

console.log('🛠️ Initializing MongoDB connection...');

const mongoURI = 'mongodb+srv://bbeuttel:Bsb72487%21@spotifytoken.ufkcl.mongodb.net/?retryWrites=true&w=majority&appName=SpotifyToken';

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

const Token = mongoose.model('Token', TokenSchema);
console.log('✅ Repo model created.');

export default Token;