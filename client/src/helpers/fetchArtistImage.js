/**
 * fetchArtistImage
 * 
 * Fetches an artist's image from the Spotify API through the backend.
 * Returns a placeholder image if the artist name is empty or if the API call fails.
 * 
 * @param {string} artistName - Name of the artist to fetch image for
 * @returns {Promise<string>} URL of the artist's image or placeholder image
 */

import axios from 'axios';
import placeholderImage from '../assets/Placeholder1.webp';

export const fetchArtistImage = async (artistName) => {
  // Return placeholder if artist name is empty
  if (!artistName.trim()) return placeholderImage;

  try {
    // Make API request to backend for Spotify image
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/spotify`,
      { artists: [artistName] },
      { headers: { 'Content-Type': 'application/json' } }
    );

    // Return image URL from response or fallback to placeholder
    return response.data[artistName.toLowerCase()] || placeholderImage;
  } catch (error) {
    console.error(`Error fetching image for ${artistName}:`, error);
    return placeholderImage; // Fallback in case of error
  }
};
