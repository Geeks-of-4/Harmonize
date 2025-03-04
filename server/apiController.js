// This api controller has 2 functions, one for Ticket Master, and one for Spotify.
// The spotify function retrieves images, while the ticket master gets event data.
// Both of these were intended to be client side, but it turns out that CORS errors are a thing.
// The spare keys here for ticket master are because we have not implemented a bottleneck or rate limiter
// and so occasionally we get flagged for rate limits when we click the button too much for testing. 
// ! You will need your own keys, because ours will expire eventually.
// * Also, you should put them in a .env file. We were lazy, don't be.

import axios from 'axios';
import { getToken } from './helperFunctions.js';

const apiController = {};

apiController.getTicketMasterData = async (req, res, next) => {
  console.log('🎫 Getting ticket master data!');
  if (!Array.isArray(req.body) || req.body.length < 2) {
    return next({
      log: 'Invalid request body: Expected an array with two artist names',
      status: 400,
      message: { error: 'Invalid input. Please provide two artist names.' },
    });
  }
  const [artist1, artist2] = req.body;
  const now = new Date();
  const currentTime = now.toISOString().split('.')[0] + 'Z'; // Remove milliseconds
  now.setMonth(now.getMonth() + 12);
  const monthRange = now.toISOString().split('.')[0] + 'Z';
  //!create Ticketmaster Dev account for apiKey
  const apiKey = //*insert api here
  
  const baseUrl = 'https://app.ticketmaster.com/discovery/v2/events.json';
  const url1 = `${baseUrl}?keyword=${encodeURIComponent(
    artist1
  )}&startDateTime=${currentTime}&endDateTime=${monthRange}&apikey=${apiKey}`;
  const url2 = `${baseUrl}?keyword=${encodeURIComponent(
    artist2
  )}&startDateTime=${currentTime}&endDateTime=${monthRange}&apikey=${apiKey}`;
  try {
    const [response1, response2] = await Promise.all([
      axios.get(url1),
      axios.get(url2),
    ]);
    console.log(response1);
    // console.log(response2.headers);
    console.log('📫 Sending ticket master response!');
    return res.status(200).json({
      artist1: response1.data,
      artist2: response2.data,
    });
  } catch (error) {
    console.error(
      '☠️ getTicketMasterData Controller API Error:',
      error.message
    );
    return next({
      log: `getTicketMasterData Controller API Error: ${error.message}`,
      status: 500,
      message: { error: 'Failed to fetch Ticket Master data!' },
    });
  }
};

apiController.getSpotifyImageData = async (req, res, next) => {
  // Spotify API Post Request for access token
  const [artist1, artist2] = req.body;
  const baseUrl = 'https://api.spotify.com/v1/search?q=';
  const url1 = `${baseUrl}${encodeURI(artist1)}&type=artist`;
  const url2 = `${baseUrl}${encodeURI(artist2)}&type=artist`;

  // const accessToken = {"access_token": "BQAap0nXlZH_CEGMKLCjupPuBHqyZ8rI9IDY50scVTAROUvw44Vl5D684mEET-CRM-nCjuSy0CZGk_RjNKI6T82IBBGaRNeSUu32tZxGyTHyAg6gq7Q5zCYSwzFZ-AroqafYzSCi6hM", "token_type": "Bearer", "expires_in": 3600}
  if (!Array.isArray(req.body) || req.body.length < 2) {
    return next({
      log: 'Invalid request body: Expected an array with two artist names',
      status: 400,
      message: { error: 'Invalid input. Please provide two artist names.' },
    });
  }
  try {
    console.log(url1);
    console.log(url2);
    // get our access code
    const accessToken = await getToken();
    console.log(accessToken);
    console.log(accessToken.access_token);
    // make a request to spotify
    const [response1, response2] = await Promise.all([
      axios.get(url1, {
        headers: { Authorization: 'Bearer ' + accessToken.access_token },
      }),
      axios.get(url2, {
        headers: { Authorization: 'Bearer ' + accessToken.access_token },
      }),
    ]);
    // console.log(response1.data.artists.items[0].images[0].url);
    // console.log(response2.data.artists.items[0].images[0].url);
    const imageSrc1 = response1.data.artists.items[0].images[0].url || ''; // Replace empty string with default image1
    const imageSrc2 = response2.data.artists.items[0].images[0].url || '';

    // send the response back to the client
    return res.status(200).json({ image1: imageSrc1, image2: imageSrc2 });
  } catch (error) {
    return next({
      log: `getSpotifyImageData Controller API Error: ${error.message}`,
      status: 500,
      message: { error: 'Failed to fetch Spotify Image data!' },
    });
  }
};

export default apiController;
