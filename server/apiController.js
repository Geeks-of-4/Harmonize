import axios from 'axios';
import { getToken } from './helperFunctions.js'

const apiController = {};

apiController.getTicketMasterData = async (req, res, next) => {
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
  const apiKey = 'K2UGwYuaehCHov5Edy6YkJiYUlmKXPRB';
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
    // console.log(response1.headers);
    // console.log(response2.headers);
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
  const url1 = `${baseUrl}${artist1}&type=artist`;
  const url2 = `${baseUrl}${artist2}&type=artist`;

  // const accessToken = {"access_token": "BQAap0nXlZH_CEGMKLCjupPuBHqyZ8rI9IDY50scVTAROUvw44Vl5D684mEET-CRM-nCjuSy0CZGk_RjNKI6T82IBBGaRNeSUu32tZxGyTHyAg6gq7Q5zCYSwzFZ-AroqafYzSCi6hM", "token_type": "Bearer", "expires_in": 3600}
  if (!Array.isArray(req.body) || req.body.length < 2) {
    return next({
      log: 'Invalid request body: Expected an array with two artist names',
      status: 400,
      message: { error: 'Invalid input. Please provide two artist names.' },
    });
  }
  try {
    console.log(url1)
    console.log(url2)
    // get our access code
    const accessToken = await getToken()
    console.log(accessToken)
    console.log(accessToken.access_token)
    // make a request to spotify
    const [response1, response2] = await Promise.all([
      axios.get(url1, {headers: {Authorization: 'Bearer ' + accessToken.access_token}}),
      axios.get(url2, {headers: {Authorization: 'Bearer ' + accessToken.access_token}})
      ]);
    console.log(artist1.images[0].url);
    console.log(artist2.images[0].url);
    const imageSrc1 = response1.data.artist1.images[0].url || '';  // Replace empty string with default image1
    const imageSrc2 = response2.data.artist2.images[0].url || '';
    
    // send the response back to the client
    return res.status(200).json({image1: imageSrc1, image2: imageSrc2,});
  } catch (error) {
    return next({
        log: `getSpotifyImageData Controller API Error: ${error.message}`,
        status: 500,
        message: { error: 'Failed to fetch Spotify Image data!' },
      });
    }
  }


export default apiController;
