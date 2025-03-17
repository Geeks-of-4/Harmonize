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
  const sanitizedArtists = artists
    .map(sanitizeInput)
    .filter((artist) => artist.trim() !== ''); // Remove empty strings

  if (sanitizedArtists.length < 2) {
    console.warn('⚠️ At least two artists are required.');
    return;
  }

  setClickStatus(true);

  try {
    // Get Concert Data
    const tmResponse = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/TM`,
      {
        artists: sanitizedArtists,
        daysMaximum: days,
        rangeMaximum: miles,
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    // Validate API responses before updating state
    if (!tmResponse.data || Object.keys(tmResponse.data).length === 0) {
      console.warn('⚠️ No events found.');
      setClickStatus(false);
      return;
    }

    const { artists: responseArtists, matches } = tmResponse.data;

    if (!responseArtists || Object.keys(responseArtists).length === 0) {
      console.warn('⚠️ No artist event data found.');
      setClickStatus(false);
      return;
    }

    if (!matches || matches.length === 0) {
      console.warn('⚠️ No matching events found.');
      setClickStatus(false);
      return;
    }

    // Update the intersect state if matches exist
    setTours(matches);
    setSiblingIntersect([]); // Reset sibling intersect on new search

    // Scroll to results
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
