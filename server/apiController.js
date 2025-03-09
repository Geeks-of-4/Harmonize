import axios from 'axios';
import { getToken } from './helpers/getToken.js';
import { TicketmasterCache, SpotifyCache } from './db.js';
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

    let cacheData = Object.fromEntries(
      req.body.map((artist) => [artist.toLowerCase(), null])
    );

    if (cachedArtists.length) {
      console.log('🎯 Ticket Master Cache Hit!', cachedArtists);
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

    console.log('🥾 Ticket Master Cache miss!');

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
      const artistName = response.value.artist;
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
    // console.log('🔍 Ticket Master Return Data:', newCacheData);

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
  const [artist1, artist2] = req.body.map((artist) => artist.toLowerCase());

  const baseUrl = 'https://api.spotify.com/v1/search?q=';
  const url1 = `${baseUrl}${encodeURIComponent(artist1)}&type=artist`;
  const url2 = `${baseUrl}${encodeURIComponent(artist2)}&type=artist`;

  if (!Array.isArray(req.body) || req.body.length < 2) {
    return next({
      log: 'Invalid request body: Expected an array with two artist names',
      status: 400,
      message: { error: 'Invalid input. Please provide two artist names.' },
    });
  }

  try {
    console.log('📀 Checking cache for Spotify artist images...');
    // console.log(url1);
    // console.log(url2);

    // Step 1: Check MongoDB Cache for one or both artists
    const cachedArtists = await SpotifyCache.find({
      artistName: { $in: [artist1, artist2] },
    });

    let cacheData = { [artist1]: null, [artist2]: null };

    if (cachedArtists.length) {
      console.log('🎯 Spotify Cache Hit!', cachedArtists);
      cachedArtists.forEach((entry) => {
        cacheData[entry.artistName] = entry.imageUrl;
      });
    }

    // Step 2: If both artists are found, return them immediately
    if (cacheData[artist1] && cacheData[artist2]) {
      console.log('🔁 Returning cached Spotify images.');
      return res
        .status(200)
        .json({ image1: cacheData[artist1], image2: cacheData[artist2] });
    }

    console.log('🥾 Cache miss! Fetching from Spotify...');

    // Step 3: Fetch missing artist(s) from Spotify
    const artistsToFetch = [];
    if (!cacheData[artist1]) artistsToFetch.push(artist1);
    if (!cacheData[artist2]) artistsToFetch.push(artist2);

    if (artistsToFetch.length > 0) {
      const accessToken = await getToken();
      const fetchPromises = artistsToFetch.map(async (artist) => {
        const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          artist
        )}&type=artist`;
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const imageUrl = response.data.artists.items[0]?.images[0]?.url || '';
        return { artist, imageUrl };
      });

      const freshResponses = await Promise.all(fetchPromises);

      // Step 4: Save new images to cache
      for (const { artist, imageUrl } of freshResponses) {
        cacheData[artist] = imageUrl;

        await SpotifyCache.findOneAndUpdate(
          { artistName: artist.toLowerCase() },
          { imageUrl, lastUpdated: new Date() },
          { upsert: true, new: true }
        );
      }
    }

    console.log('📥 Cached new Spotify artist images.');

    // Step 5: Return a combination of cached & fresh data
    return res
      .status(200)
      .json({ image1: cacheData[artist1], image2: cacheData[artist2] });

  } catch (error) {
    console.error('❌ Failed to fetch Spotify Image data:', error.message);
    return next({ status: 500, message: 'Failed to fetch Spotify Image data' });
  }
};

export default apiController;
