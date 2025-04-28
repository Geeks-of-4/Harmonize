/**
 * API Response Processor
 * 
 * Processes and validates responses from the Ticketmaster API.
 * Handles retries and error cases for failed requests.
 */

import { extractEventData } from './extractEventData.js';
import { fetchTicketmasterData } from './ticketMasterAPICall.js';

/**
 * processResponse
 * 
 * Processes a Ticketmaster API response for a specific artist.
 * Extracts event data and handles retries for failed requests.
 * 
 * @param {Object} response - API response object
 * @param {string} artistName - Name of the artist being processed
 * @param {number} attempt - Current attempt number (default: 1)
 * @returns {Promise<Object>} Processed response with event data
 */
export const processResponse = async (response, artistName, attempt = 1) => {
  console.log(`🔍 Processing response for ${artistName}`);

  // Extract events from response
  const data = response.value?.data || {};
  const events = data._embedded?.events || [];

  console.log(`🎭 Extracted Events for ${artistName}:`, events.length);

  // Process successful response with events
  if (response.status === 'fulfilled' && events.length > 0) {
    const extractedEvents = await extractEventData(data);

    console.log(`✅ Processed ${extractedEvents.length} events for ${artistName}`);

    return {
      artistName,
      events: extractedEvents,
      status: 'success',
      lastUpdated: new Date(),
    };
  }
  // TODO This logic does not read response headers, and could be bypassed if the response was valid.
  // *Theoretically, re attempts should only be triggered when there is an error, or cached data is stale. 
  console.warn(`⚠️ No events found for ${artistName}, marking as empty_response`);

  // Retry once if this is the first attempt
  if (attempt === 1) {
    console.log(`🔄 Retrying Ticketmaster fetch for ${artistName}...`);
    const retryResponse = await fetchTicketmasterData([artistName]);
    return processResponse(retryResponse[0], artistName, attempt + 1);
  }

  // Return empty response after failed retry
  console.warn(
    `❌ Second attempt failed for ${artistName}, marking as empty_response`
  );

  return {
    artistName,
    events: [],
    status: 'empty_response',
    lastUpdated: new Date(),
  };
};
