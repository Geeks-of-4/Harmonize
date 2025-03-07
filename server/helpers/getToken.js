// This is the helper function to retrieve or create a spotify API key.
// See the db file for an explanation of why this exists.
import Token from '../db.js';
import axios from 'axios';
import dotenv from 'dotenv';

export async function getToken() {
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
  const existingToken = await Token.find();
  // this checks if one exists, if so, it returns a token
  if (existingToken.tokenExpiry > Date.now()) return existingToken.access_token;
  // if we do not fine a token, we do this:
  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'client_credentials',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + btoa(client_id + ':' + client_secret),
        },
      }
    );
    // Stores token in MongoDB (Update if exists, Insert if new)
    await Token.deleteMany({});
    const updatedToken = await Token.create({
      access_token: response.data.access_token,
      token_type: response.data.token_type,
      expires_in: response.data.expires_in,
      token_expiry: Math.floor(Date.now() / 1000) + response.data.expires_in,
    });

    return updatedToken;
  } catch (error) {
    console.error('Failed to fetch token:', error.message);
  }
}
