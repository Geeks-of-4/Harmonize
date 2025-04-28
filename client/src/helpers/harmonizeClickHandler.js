/**
 * harmonizeClickHandler
 * 
 * Main handler function for the harmonize button click event.
 * Processes artist inputs, makes API calls, and updates application state.
 * 
 * @param {Object} params - Object containing function parameters
 * @param {Array} params.artists - Array of artist names to search for
 * @param {number} params.days - Maximum days between concerts
 * @param {number} params.miles - Maximum distance between venues
 * @param {Function} params.setClickStatus - State setter for click status
 * @param {Function} params.setTours - State setter for tour data
 * @param {Function} params.setSiblingIntersect - State setter for selected events
 */

import axios from 'axios';
import { sanitizeInput } from './inputSanitizer';

export const harmonizeClickHandler = async ({ 
  artists, 
  days, 
  miles, 
  setClickStatus, 
  setTours, 
  setSiblingIntersect 
}) => {
  // Sanitize and filter artist inputs
  const sanitizedArtists = artists
    .map(sanitizeInput)
    .filter((artist) => artist.trim() !== ''); // Remove empty strings

  // Validate minimum artist count
  if (sanitizedArtists.length < 2) {
    console.warn('⚠️ At least two artists are required.');
    return;
  }

  // Set loading state
  setClickStatus(true);

  try {
    // Fetch concert data from backend
    const tmResponse = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/TM`,
      {
        artists: sanitizedArtists,
        daysMaximum: days,
        rangeMaximum: miles,
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    // Validate API response data
    if (!tmResponse.data || Object.keys(tmResponse.data).length === 0) {
      console.warn('⚠️ No events found.');
      setClickStatus(false);
      return;
    }

    const { artists: responseArtists, matches } = tmResponse.data;

    // Validate artist data
    if (!responseArtists || Object.keys(responseArtists).length === 0) {
      console.warn('⚠️ No artist event data found.');
      setClickStatus(false);
      return;
    }

    // Validate matching events
    if (!matches || matches.length === 0) {
      console.warn('⚠️ No matching events found.');
      setClickStatus(false);
      return;
    }

    // Update application state with results
    setTours(matches);
    setSiblingIntersect([]); // Reset sibling intersect on new search

    // Scroll to results section
    document.querySelector('.subMain-container').scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    });

  } catch (err) {
    console.error('❌ API Fetch Error:', err);
    setClickStatus(false);
  }
};
