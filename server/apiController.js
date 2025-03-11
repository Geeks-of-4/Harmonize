import axios from 'axios';
import { TicketmasterCache, SpotifyCache } from './db.js';
import { getToken } from './helpers/getToken.js';
import { processResponse } from './helpers/processApiResp.js';
import { fetchTicketmasterData } from './helpers/ticketMasterAPICall.js';
import { findMatchingEvents } from './helpers/findMatchingEvents.js';

const apiController = {};

apiController.getTicketMasterData = async (req, res, next) => {
  const { artists, daysMaximum = 7, rangeMaximum = 100 } = req.body;

  if (!Array.isArray(artists) || artists.length < 1) {
    return next({
      log: 'Invalid request body: Expected at least one artist name.',
      status: 400,
      message: {
        error: 'Invalid input. Please provide at least one artist name.',
      },
    });
  }

  try {
    console.log('📀 Checking cache for Ticketmaster data...');

    // Check Cache First for data for either artist
    const cachedArtists = await TicketmasterCache.find({
      artistName: { $in: artists },
    });

    let cacheData = Object.fromEntries(artists.map((artist) => [artist, null]));

    if (cachedArtists.length) {
      console.log('🎯 Ticket Master Cache Hit!', cachedArtists);
      cachedArtists.forEach((entry) => {
        cacheData[entry.artistName] = entry;
      });

      // If all artists are found in cache, return them immediately
      if (artists.every((artist) => cacheData[artist])) {
        console.log('🔁 Returning fully cached Ticketmaster data.');
        // This is just logging the status of each artist:
        Object.entries(cacheData).forEach(([artist, data], index) => {
          console.log(
            `🔍 Cached Artist ${index + 1} (${artist}) Status:`,
            data?.status || 'Not Found'
          );
        });
        req.ticketmasterData = cacheData;
        return next();
      }
    }

    console.log('🥾 Ticket Master Cache miss!');

    // Prep data for TM API Request for the remaining missing artists
    const artistsToFetch = artists.filter((artist) => !cacheData[artist]);

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

    // Save fetched data to Mongo DB
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
    req.ticketmasterData = Object.fromEntries(
      artists.map((artist) => [artist, newCacheData[artist] || null])
    );

    next();
  } catch (error) {
    console.error('☠️ Ticketmaster API Error:', error.message);

    return next({
      log: `getTicketMasterData API Error: ${error.message}`,
      status: error.response?.status || 500,
      message: { error: 'Failed to fetch Ticketmaster data!' },
    });
  }
};

apiController.getMatchingEvents = async (req, res, next) => {
  console.log(
    '🔍 Ticketmaster Data Before Matching:',
    JSON.stringify(req.ticketmasterData, null, 2)
  );

  const { daysMaximum = 7, rangeMaximum = 100 } = req.body;
  const { ticketmasterData } = req;
  const formattedData = Object.fromEntries(
    Object.entries(req.ticketmasterData).map(([artist, data]) => [
      artist,
      data.events,
    ])
  );

  try {
    if (!ticketmasterData || Object.keys(ticketmasterData).length < 2) {
      console.warn('⚠️ Not enough artists to match events.');
      return res.status(200).json({ artists: ticketmasterData, matches: [] });
    }

    console.log(
      `🔍 Matching events across ${
        Object.keys(ticketmasterData).length
      } artists...`
    );

    const matches = findMatchingEvents(
      formattedData,
      daysMaximum,
      rangeMaximum
    );

    return res.status(200).json({ artists: ticketmasterData, matches });
  } catch (error) {
    console.error('☠️ Error in getMatchingEvents:', error.message);
    return next({
      log: `getMatchingEvents API Error: ${error.message}`,
      status: 500,
      message: { error: 'Failed to match events!' },
    });
  }
};

apiController.getSpotifyImageData = async (req, res, next) => {
  if (!req.body.artists || !Array.isArray(req.body.artists) || req.body.artists.length < 1) {
    return next({
      log: 'Invalid request body: Expected an object with an "artists" array containing at least 1 artist name.',
      status: 400,
      message: { error: 'Invalid input. Please provide an "artists" array with at least one artist name.' },
    });
  }
  
  const artists = req.body.artists.map((artist) => artist.toLowerCase());

  try {
    console.log('📀 Checking cache for Spotify artist images...');
    // console.log(url1);
    // console.log(url2);

    // Step 1: Check MongoDB Cache for one or both artists
    const cachedArtists = await SpotifyCache.find({
      artistName: { $in: artists },
    });

    let cacheData = Object.fromEntries(artists.map((artist) => [artist, null]));

    if (cachedArtists.length) {
      console.log('🎯 Spotify Cache Hit!', cachedArtists);
      cachedArtists.forEach((entry) => {
        cacheData[entry.artistName] = entry.imageUrl;
      });

      // Step 2: If both artists are found, return them immediately
      if (artists.every((artist) => cacheData[artist])) {
        console.log('🔁 Returning fully cached Spotify images.');
        return res.status(200).json(cacheData);
      }
    }

    console.log(
      '🥾 Cache miss! Fetching missing artist images from Spotify...'
    );

    // Step 3: Fetch missing artist(s) from Spotify
    const artistsToFetch = artists.filter((artist) => !cacheData[artist]);

    if (artistsToFetch.length > 0) {
      const accessToken = await getToken();
      const fetchPromises = artistsToFetch.map(async (artist) => {
        const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          artist
        )}&type=artist`;
        try {
          const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          const imageUrl = response.data.artists.items[0]?.images[0]?.url || '';
          return { artist, imageUrl };
        } catch (error) {
          console.warn(
            `⚠️ Failed to fetch image for ${artist}:`,
            error.message
          );
          return { artist, imageUrl: null };
        }
      });

      const freshResponses = await Promise.all(fetchPromises);

      // Step 4: Save new images to cache
      for (const { artist, imageUrl } of freshResponses) {
        cacheData[artist] = imageUrl;

        if (imageUrl) {
          await SpotifyCache.findOneAndUpdate(
            { artistName: artist.toLowerCase() },
            { imageUrl, lastUpdated: new Date() },
            { upsert: true, new: true }
          );
        }
      }
    }

    console.log('📥 Cached new Spotify artist images.');

    // Step 5: Return a combination of cached & fresh data
    return res.status(200).json(cacheData);
  } catch (error) {
    console.error('❌ Failed to fetch Spotify Image data:', error.message);
    return next({ status: 500, message: 'Failed to fetch Spotify Image data' });
  }
};

export default apiController;
