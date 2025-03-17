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

    return () => clearTimeout(handler); // Cleanup function
  }, [artists, delay]);

  return debouncedArtists;
};
