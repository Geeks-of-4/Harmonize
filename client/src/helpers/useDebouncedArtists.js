/**
 * Custom Hook: useDebouncedArtists
 * 
 * Implements debouncing for artist input to prevent excessive API calls.
 * Waits for a specified delay after the last input change before updating the state.
 * 
 * @param {Array} artists - Array of artist names to debounce
 * @param {number} delay - Delay in milliseconds before updating state (default: 1000ms)
 * @returns {Array} Debounced array of artist names
 */

import { useEffect, useState } from 'react';

export const useDebouncedArtists = (artists, delay = 1000) => {
  const [debouncedArtists, setDebouncedArtists] = useState(artists);

  useEffect(() => {
    // If artists array is empty, reset debounced state immediately
    if (!artists || artists.length === 0) {
      setDebouncedArtists([]);
      return;
    }

    // Debounce logic: Wait for user to stop typing before updating state
    const handler = setTimeout(() => {
      setDebouncedArtists([...artists]); // Apply debounced value
    }, delay);

    // Cleanup function to clear timeout on unmount or when dependencies change
    return () => clearTimeout(handler);
  }, [artists, delay]);

  return debouncedArtists;
};
