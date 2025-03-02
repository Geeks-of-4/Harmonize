// Extract the venues, dates, and artist name from the api response
export function extractDataFromApiResponse(eventData) {
  console.log('⌛ Date Extraction from API Response Initiated');
  // create an array of events from the api response's embedded events object
  const events = eventData?._embedded.events || [];
  // return the object in the correct format, pulling out the venue, location, and lat/long
  return events
    .map((event) => {
      const venue = event._embedded.venues[0];
      const location = venue.location || {};
      const event_date = event.dates.start.localDate;
      // make sure lat/long exist, if not, return nothing early
      if (!location.latitude || !location.longitude) return null;
      const returnData = {
        artist: event.name,
        event_date: event_date,
        venue_name: venue.name || 'Unknown Venue',
        lat: location.latitude,
        lng: location.longitude,
      };
      return returnData;
    })
    .filter(Boolean);
}
