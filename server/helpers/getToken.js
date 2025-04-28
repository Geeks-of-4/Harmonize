/**
 * Spotify Token Manager
 * 
 * Handles authentication with the Spotify API by managing access tokens.
 * Implements token caching and automatic refresh when expired.
 */

import { Token } from '../db.js';
import axios from 'axios';
import dotenv from 'dotenv';

/**
 * getToken
 * 
 * Retrieves a valid Spotify API access token.
 * First checks for a cached token, then requests a new one if needed.
 * 
 * @returns {Promise<string|null>} Spotify access token or null if request fails
 * @throws {Error} If Spotify API credentials are missing
 */
export async function getToken() {
  // Get Spotify API credentials from environment variables
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

  // console.log('Spotify Client ID: ', client_id);
  // console.log('Spotify Client Secret: ', client_secret);

  // Validate required credentials
  if (!client_id || !client_secret) {
    console.error(
      '❌ Missing Spotify API credentials. Check environment variables.'
    );
    throw new Error('SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set.');
  }

  // Check for existing valid token in database
  const existingToken = await Token.findOne();

  // Return cached token if it's still valid
  if (
    existingToken &&
    existingToken.token_expiry > Math.floor(Date.now() / 1000)
  ) {
    console.log('👻 Using cached token.'); //:', existingToken.access_token);
    return existingToken.access_token;
  }

  // Request new token from Spotify
  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'client_credentials',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization:
            'Basic ' +
            Buffer.from(client_id + ':' + client_secret).toString('base64'),
        },
      }
    );

    // Store new token in database
    const updatedToken = await Token.findOneAndUpdate(
      {},
      {
        access_token: response.data.access_token,
        token_type: response.data.token_type,
        token_expiry: Math.floor(Date.now() / 1000) + response.data.expires_in,
      },
      { upsert: true, new: true }
    );

    console.log('🛠️ Token save operation result:', updatedToken);

    return updatedToken.access_token;
  } catch (error) {
    console.error('❌ Failed to fetch Spotify token:', error.message);
    return null;
  }
}
