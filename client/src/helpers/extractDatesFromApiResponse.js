import axios from 'axios';

// Extract the venues, dates, and artist name from the api response
export async function extractDataFromApiResponse(eventData) {
  console.log('⌛ Date Extraction from API Response Initiated');
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
      // ! i have a feeling this will make the api response unbearably slow... maybe
      if (!lat || !lng) {
        // so google will accept some pretty trashy address lines, so we are appending whatever we have
        const formattedAddress = `${venue.address?.line1 || ''}, ${
          venue.city?.name || ''
        }, ${venue.state?.stateCode || ''} ${venue.postalCode || ''}`;
        console.log(`📍 Fetching lat/lng for: ${formattedAddress}`);

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
async function getLatLngFromAddress(address) {
  const apiKey = 'AIzaSyBhHsZZpF0lVjUtjHlzNjGTrHBr4ZM5nO0';
  const encodedAddress = encodeURIComponent(address);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const data = response.data;
    if (data.status === 'OK') {
      console.log('🗺️ We dun geocoded a thing...');
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
