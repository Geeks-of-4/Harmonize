import axios from 'axios';
import placeholderImage from '../assets/Placeholder1.webp';

export const fetchArtistImage = async (artistName) => {
  if (!artistName.trim()) return placeholderImage; // Return placeholder if empty

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/spotify`,
      { artists: [artistName] },
      { headers: { 'Content-Type': 'application/json' } }
    );

    return response.data[artistName.toLowerCase()] || placeholderImage;
  } catch (error) {
    console.error(`Error fetching image for ${artistName}:`, error);
    return placeholderImage; // Fallback in case of error
  }
};
