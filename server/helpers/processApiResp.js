import { extractEventData } from './extractEventData.js';
import { fetchTicketmasterData } from './ticketMasterAPICall.js';
// Helper function to process responses
export const processResponse = async (response, artistName, attempt = 1) => {

  console.log(`🔍 Processing response for ${artistName}`);

  const data = response.value?.data || {};
  const events = data._embedded?.events || [];

  console.log(`🎭 Extracted Events for ${artistName}:`, events.length);

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

  if (attempt === 1) {
    console.log(`🔄 Retrying Ticketmaster fetch for ${artistName}...`);
    const retryResponse = await fetchTicketmasterData([artistName]); // ✅ Use new helper function
    return processResponse(retryResponse[0], artistName, attempt + 1);
  }

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
