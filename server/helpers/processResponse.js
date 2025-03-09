import { extractEventData } from './extractEventData';

// Helper function to process responses
export const processResponse = async (response, artistName) => {
  if (
    response.status === 'fulfilled' &&
    response.value.data._embedded?.events
  ) {
    const extractedEvents = await extractEventData(response.value.data);
    return {
      artistName,
      events: extractedEvents,
      status: 'success',
      lastUpdated: new Date(),
    };
  }
  return {
    artistName,
    events: [],
    status: response.status === 'fulfilled' ? 'empty_response' : 'api_error',
    lastUpdated: new Date(),
  };
};
