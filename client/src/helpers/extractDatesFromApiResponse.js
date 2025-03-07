// Ho boy, so this one is a bit complicated. The general goal is to get the subset of results from an artist that are
// within X miles and Y date of another event, but this means I have a nested for loop that is checking every event against
// every other event to find those that qualify.
// The first couple iterations of this code had a TON of duplicates, and eventually I just put them in a set to de duplicate them.
// *this function is a prime candidate for caching, so that if a duplicate is detected (in the cache), it doesn't get added again.
// However, it definitely does not do that at the moment.
// Side Note: There are still duplicates in here, somewhere. If you test "knocked loose" against "sleep token" with 100 miles and 7 days
// you will see a number of "2 events in Derby" over and over again. who knows why... ¯\_(ツ)_/¯
// anyhow, the logic here
// *Extracts Events: Retrieves event data from the provided API response.
// Creates Event List: Extracts an array of events from the _embedded.events object or returns an empty array if none exist.
// Processes Each Event: Iterates through each event and extracts key details like:
// Extracts Location Data: Attempts to get the latitude (lat) and longitude (lng) from the venue's location.
// Handles Missing Coordinates: If latitude or longitude is missing, it:
// Constructs a formatted address using available venue details.
// Calls getLatLngFromAddress(address) to fetch coordinates from Google’s geocoding API.
// Logs the lookup attempt and warns if unsuccessful.
// Filters Out Invalid Data: If an event has missing location data and geocoding fails, it is removed from the final output.
// Returns Cleaned Data: Returns a list of events with structured information.
// * The helper function getLatLngFromAddress(address):
// Encodes Address: Formats and encodes the address to send a request to Google Maps API.
// Fetches Geolocation Data: Makes an API request to get latitude and longitude.
// Handles API Response:
// If successful, returns the coordinates.
// If unsuccessful, logs an error and returns null.
import axios from 'axios';
// Extract the venues, dates, and artist name from the api response
export async function extractDataFromApiResponse(eventData) {
  // console.log('⌛ Date Extraction from API Response Initiated');
  // create an array of events from the api response's embedded events object
  const events = eventData?._embedded.events || [];
  // return the object in the correct format, pulling out the venue, location, and lat/long
  const processedEvents = await Promise.all(
    // there is so much shit in the api response that DOESNT exist so im just going to add "?" handlers to every line
    events.map(async (event) => {
      const venue = event._embedded?.venues?.[0] || {};
      const location = venue.location || {};
      const event_date = event.dates?.start?.localDate || 'Unknown Date';
      const ticket_url = event.url;

      let lat = location.latitude;
      let lng = location.longitude;

      // make sure lat/long exist, if not, fetch it from google
      if (!lat || !lng) {
        // so google will accept some pretty trashy address lines, so we are appending whatever we have
        const formattedAddress = `${venue.address?.line1 || ''}, ${
          venue.city?.name || ''
        }, ${venue.state?.stateCode || ''} ${venue.postalCode || ''}`;
        // console.log(`📍 Fetching lat/lng for: ${formattedAddress}`);

        const decodedAddress = await getLatLngFromAddress(formattedAddress);
        if (decodedAddress) {
          lat = decodedAddress.lat;
          lng = decodedAddress.lng;
        } else {
          console.warn(
            `⚠️ Unable to fetch coordinates for ${formattedAddress}`
          );
          return null; // Skip this event if we can't get a valid location
        }
      }

      return {
        artist: event.name,
        event_date,
        venue_name: venue.name || 'Unknown Venue',
        city: venue.city?.name || 'Unknown City',
        lat,
        lng,
        ticket_url,
      };
    })
  );
  // filter out any null results AKA failed geocoding lookups
  return processedEvents.filter(Boolean);
}

// this is the helper function we call to get the Decoded Address
// side note: it turns out the event data from ticket master is pretty good, and this API doesn't really do much.
// still, it works as expected, and occasionally adds a lat/long to an address that didn't have one.
async function getLatLngFromAddress(address) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const encodedAddress = encodeURIComponent(address);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const data = response.data;
    if (data.status === 'OK') {
      // console.log('🗺️ We dun geocoded a thing...');
      return data.results[0].geometry.location;
    } else {
      console.error('Geocoding API error:', data);
      return null;
    }
  } catch (error) {
    console.error('Error fetching geocode:', error);
    return null;
  }
}
