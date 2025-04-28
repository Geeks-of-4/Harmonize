/**
 * Ticketmaster API Client
 * 
 * Handles fetching concert data from the Ticketmaster Discovery API.
 * Note: Currently limited to 20 results per artist, pagination may be needed.
 */

import axios from 'axios';

/**
 * fetchTicketmasterData
 * 
 * Fetches concert data for multiple artists from Ticketmaster API.
 * Searches for events within the next 12 months.
 * 
 * @param {Array<string>} artists - Array of artist names to search for
 * @returns {Promise<Array>} Array of API responses for each artist
 * @throws {Error} If artists parameter is not an array
 */


// TODO: It appears that the results are limited to 20, which may mean we need to deal with pagination of some sort
export const fetchTicketmasterData = async (artists) => {
  // Validate input parameter
  if (!Array.isArray(artists)) {
    throw new Error("❌ fetchTicketmasterData expects an array of artist names.");
  }

  // Get API key and set up base URL
  const tmApiKey = process.env.TM_API_KEY;
  const baseUrl = "https://app.ticketmaster.com/discovery/v2/events.json";

  // Calculate date range for search (now to 12 months from now)
  const now = new Date();
  const currentTime = now.toISOString().split(".")[0] + "Z";
  now.setMonth(now.getMonth() + 12);
  const monthRange = now.toISOString().split(".")[0] + "Z";

  // Create array of promises for parallel API requests
  const fetchPromises = artists.map(async (artist) => {
    const url = `${baseUrl}?keyword=${encodeURIComponent(
      artist
    )}&startDateTime=${currentTime}&endDateTime=${monthRange}&apikey=${tmApiKey}`;

    try {
      console.log(`🎟️ Fetching Ticketmaster API for: ${artist}`);
      console.log(`🔗 API Request URL: ${url}`);

      const response = await axios.get(url);
      
      // Warning, this console log is massive
      // console.log(`✅ Ticketmaster Response for ${artist}:`, JSON.stringify(response.data, null, 2));
      
      return { artist, data: response.data };
    } catch (error) {
      console.error(`❌ Ticketmaster API Error for ${artist}:`, error.message);
      return { artist, error: error.message };
    }
  });

  // Execute all requests in parallel and return results
  return Promise.allSettled(fetchPromises);
};