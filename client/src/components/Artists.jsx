import { useState, useEffect } from 'react';
import { sanitizeInput } from './../helpers/inputSanitizer';
import axios from 'axios';
import placeholderImage from '../assets/Placeholder1.webp';

const Artists = ({ artistId, setInputArtist, artist }) => {
  const inputPosition = artistId % 2 === 0 ? 'left' : 'right';
  const [imageSrc, setImageSrc] = useState(placeholderImage);
  const [debouncedArtist, setDebouncedArtist] = useState(artist); // Store debounced input

  useEffect(() => {
    // Set a timeout to update the debounced value after the user stops typing
    const handler = setTimeout(() => {
      setDebouncedArtist(artist);
    }, 1500); 

    return () => {
      // Clear timeout if the user types again
      clearTimeout(handler); 
    };
    // Runs when `artist` changes
  }, [artist]); 

  useEffect(() => {
    const fetchArtistImage = async () => {
      if (!debouncedArtist.trim()) {
        // Reset image if input is empty
        setImageSrc(placeholderImage); 
        return;
      }
      // Provide URL for backend, default is set to http://localhost:9001
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/spotify`,
          { artists: [debouncedArtist] },
          { headers: { 'Content-Type': 'application/json' } }
        );

        setImageSrc(response.data[debouncedArtist.toLowerCase()] || '');
      } catch (error) {
        console.error(`Error fetching image for ${debouncedArtist}:`, error);
        setImageSrc(placeholderImage)
      }
    };

    fetchArtistImage();
  }, [debouncedArtist]); // Runs when `debouncedArtist` changes

  return (
    <div className={`artistContainer`}>
      <img src={imageSrc} alt='Artist' className='artist-image' />
      <input
        type='text'
        value={artist}
        onChange={(event) => {
          const sanitizedInput = sanitizeInput(event.target.value);
          setInputArtist(sanitizedInput);
        }}
        placeholder="Enter artist's name"
        className={`input ${inputPosition}`}
      />
    </div>
  );
};

export default Artists;
