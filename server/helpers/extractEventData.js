/**
 * Event Data Extractor
 * 
 * Processes raw Ticketmaster API event data and extracts relevant information.
 * Handles geocoding of venue addresses when coordinates are missing.
 */

import axios from 'axios';

/**
 * extractEventData
 * 
 * Processes an array of events from Ticketmaster API response.
 * Extracts venue information, dates, and coordinates.
 * Falls back to Google Maps Geocoding API if coordinates are missing.
 * 
 * @param {Object} eventData - Raw event data from Ticketmaster API
 * @returns {Promise<Array>} Array of processed event objects
 */
export async function extractEventData(eventData) {
  // Validate input data
  if (!eventData || !Array.isArray(eventData._embedded?.events)) {
    return []; // Return empty array if no valid events exist
  }

  // Process each event in parallel
  const processedEvents = await Promise.all(
    eventData._embedded.events.map(async (event) => {
      // Extract venue information
      const venue = event._embedded?.venues?.[0] || {};
      const location = venue.location || {};
      const event_date = event.dates?.start?.localDate || 'Unknown Date';
      const ticket_url = event.url;

      let lat = location.latitude;
      let lng = location.longitude;

      // If coordinates are missing, use Google Maps Geocoding API
      if (!lat || !lng) {
        const formattedAddress = `${venue.address?.line1 || ''}, ${venue.city?.name || ''}, ${venue.state?.stateCode || ''} ${venue.postalCode || ''}`;
        const decodedAddress = await getLatLngFromAddress(formattedAddress);
        if (decodedAddress) {
          lat = decodedAddress.lat;
          lng = decodedAddress.lng;
        } else {
          console.warn(`⚠️ Unable to fetch coordinates for ${formattedAddress}`);
          return null; // Skip this event if no valid location data
        }
      }

      // Return processed event object
      return {
        event: event.name,
        event_date,
        venue_name: venue.name || 'Unknown Venue',
        city: venue.city?.name || 'Unknown City',
        lat,
        lng,
        ticket_url,
      };
    })
  );

  return processedEvents.filter(Boolean); // Remove null entries
}

/**
 * getLatLngFromAddress
 * 
 * Uses Google Maps Geocoding API to convert an address to coordinates.
 * 
 * @param {string} address - Address to geocode
 * @returns {Promise<Object|null>} Object containing lat/lng or null if geocoding fails
 */
async function getLatLngFromAddress(address) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const encodedAddress = encodeURIComponent(address);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.status === 'OK') {
      return response.data.results[0].geometry.location;
    } else {
      console.error('Geocoding API error:', response.data);
      return null;
    }
  } catch (error) {
    console.error('Error fetching geocode:', error);
    return null;
  }
}