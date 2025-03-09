import { Token } from '../db.js';
import axios from 'axios';
import dotenv from 'dotenv';

export async function getToken() {
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

  // console.log('Spotify Client ID: ', client_id);
  // console.log('Spotify Client Secret: ', client_secret);

  if (!client_id || !client_secret) {
    console.error(
      '❌ Missing Spotify API credentials. Check environment variables.'
    );
    throw new Error('SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set.');
  }

  const existingToken = await Token.findOne();
  if (
    existingToken &&
    existingToken.token_expiry > Math.floor(Date.now() / 1000)
  ) {
    console.log('👻 Using cached token.'); //:', existingToken.access_token);
    return existingToken.access_token;
  }
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
          Authorization:
            'Basic ' +
            Buffer.from(client_id + ':' + client_secret).toString('base64'),
        },
      }
    );
    // Stores token in MongoDB (Update if exists, Insert if new)
    const updatedToken = await Token.findOneAndUpdate(
      {},
      {
        access_token: response.data.access_token,
        token_type: response.data.token_type,
        token_expiry:
          Math.floor(Date.now() / 1000) + response.data.expires_in * 5,
      },
      { upsert: true, new: true }
    );

    console.log('🛠️ Token save operation result:', updatedToken);

    return updatedToken;
  } catch (error) {
    console.error('❌ Failed to fetch Spotify token:', error.message);
    return null;
  }
}
