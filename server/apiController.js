import axios from 'axios';
import { getToken } from './helpers/getToken.js';
import { TicketmasterCache } from './db.js';
import { processResponse } from './helpers/processApiResp.js';
import { fetchTicketmasterData } from './helpers/ticketMasterAPICall.js';

const apiController = {};

apiController.getTicketMasterData = async (req, res, next) => {
  if (!Array.isArray(req.body) || req.body.length < 2) {
    return next({
      log: 'Invalid request body: Expected an array with two artist names',
      status: 400,
      message: { error: 'Invalid input. Please provide two artist names.' },
    });
  }

  const [artist1, artist2] = req.body.map((artist) => artist.toLowerCase());

  try {
    console.log('📀 Checking cache for Ticketmaster data...');

    // Check Cache First for data for either artist
    const cachedArtists = await TicketmasterCache.find({
      artistName: { $in: [artist1, artist2] },
    });

    let cacheData = Object.fromEntries(req.body.map((artist) => [artist.toLowerCase(), null]));

    if (cachedArtists.length) {
      console.log('🎯 Cache Hit!', cachedArtists);
      cachedArtists.forEach((entry) => {
        cacheData[entry.artistName] = entry;
      });

      // If both artists are found in cache, return them immediately
      if (cacheData[artist1] || cacheData[artist2]) {
        console.log('🔁 Returning cached Ticketmaster data: ');
        console.log('🔍 Cached Artist 1 Status:', cacheData[artist1].status);
        console.log('🔍 Cached Artist 2 Status:', cacheData[artist2].status);

        return res.status(200).json({
          artist1: cacheData[artist1],
          artist2: cacheData[artist2],
        });
      }
    }

    console.log('🥾 Cache miss!');

    // Prep data for TM API Request for the remaining missing artists
    const artistsToFetch = [];
    if (!cacheData[artist1]) artistsToFetch.push(artist1);
    if (!cacheData[artist2]) artistsToFetch.push(artist2);

    let freshResponses = [];
    if (artistsToFetch.length > 0) {
      console.log('🎫 Fetching fresh Ticketmaster data for:', artistsToFetch);
      freshResponses = await fetchTicketmasterData(artistsToFetch);
    }

    // Warning: This console log is friggen huge...
    // console.log('🎟️ Raw Ticketmaster API Response:', freshResponses);

    const newCacheData = { ...cacheData };

    for (const response of freshResponses) {
      const artistName = response.value.artist
      const processedData = await processResponse(response, artistName, 1);

      // Prevent Duplicate Storage (Only Save if Different)
      if (
        !newCacheData[artistName] ||
        JSON.stringify(newCacheData[artistName].events) !==
          JSON.stringify(processedData.events)
      ) {
        newCacheData[artistName] = processedData;
      }
    }

    // Save Artist1 and Artist2 data to Mongo DB
    await TicketmasterCache.bulkWrite(
      Object.values(newCacheData)
        .filter((data) => data)
        .map((data) => ({
          updateOne: {
            filter: { artistName: data.artistName },
            update: { $set: data },
            upsert: true,
          },
        }))
    );
    console.log('📥 Cached new Ticketmaster data.');

    // Warning, this console log is fucking huge...
    console.log('🔍 newCacheData Before Return:', newCacheData);

    // Return results
    return res.status(200).json({
      artist1: newCacheData[artist1],
      artist2: newCacheData[artist2],
    });
  } catch (error) {
    console.error('☠️ Ticketmaster API Error:', error.message);

    return next({
      log: `getTicketMasterData API Error: ${error.message}`,
      status: error.response?.status || 500,
      message: { error: 'Failed to fetch Ticketmaster data!' },
    });
  }
};

apiController.getSpotifyImageData = async (req, res, next) => {
  // Spotify API Post Request for access token
  const [artist1, artist2] = req.body;
  const baseUrl = 'https://api.spotify.com/v1/search?q=';
  const url1 = `${baseUrl}${encodeURIComponent(artist1)}&type=artist`;
  const url2 = `${baseUrl}${encodeURIComponent(artist2)}&type=artist`;

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
