
// Extract the venues, dates, and artist name from the api response
const extractDatesFromApiResponse = (eventData) => {
  // create an array of events from the api response's embedded events object
  const events = eventData?._embedded.events || [];
  // return the object in the correct format, pulling out the venue, location, and lat/long
  return events
    .map((event) => {
      const venue = event?._embedded?.venues?.[0] || {};
      const location = venue.location || {};
      // make sure lat/long exist, if not, return nothing early
      if (!location.latitude || !location.longitude) return null;

      return {
        artist: event.name,
        event_date: event.date?.start?.localDate || 'Unknown Date',
        venue_name: venue.name || 'Unknown Venue',
        lat: location.latitude,
        lng: location.longitude,
      };
    })
    .filter(Boolean);
};
