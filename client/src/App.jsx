import { useState } from 'react';
import axios from 'axios';
import Artists from './components/Artists';
import Map from './components/Map';
import Nav from './components/Nav';
import './App.css';
import HarmonizerButton from './components/HarmonizerButton';
import placeholderImage1 from './assets/Placeholder1.webp';
import placeholderImage2 from './assets/Placeholder2.webp';
import { sanitizeInput } from './helpers/inputSanitizer';

function App() {
  const [clickStatus, setClickStatus] = useState(false);
  const [artists, setInputArtists] = useState(['', '']);
  const [imageSrc, setImageSrc] = useState([
    placeholderImage1,
    placeholderImage2,
    placeholderImage1,
    placeholderImage2,
    placeholderImage1,
    placeholderImage2,
    placeholderImage1,
    placeholderImage2,
    placeholderImage1,
    placeholderImage2,
  ]);
  const [miles, setMiles] = useState(100);
  const [days, setDays] = useState(7);
  const [tours, setTours] = useState([]);
  const [siblingIntersect, setSiblingIntersect] = useState([]);

  const updateArtist = (index, value) => {
    const sanitizedValue = sanitizeInput(value);

    setInputArtists((prevArtists) => {
      const updatedArtists = [...prevArtists];
      updatedArtists[index] = sanitizedValue;

      // If at least 2 artists are entered and we haven't reached 10 yet, add a new blank input
      if (
        updatedArtists.length < 10 &&
        updatedArtists.length >= 2 &&
        updatedArtists[updatedArtists.length - 1] !== ''
      ) {
        updatedArtists.push('');
      }

      return updatedArtists;
    });
  };

  async function harmonizeClickHandler() {
    console.log('🎤 Current artists state:', artists);
    // Exit early if no input data was given
    const sanitizedArtists = artists
      .map(sanitizeInput)
      .filter((artist) => artist.trim() !== ''); // Remove empty strings

    if (sanitizedArtists.length < 2) {
      console.warn('⚠️ At least two artists are required.');
      return;
    }

    console.log('🎤 Sanitized Artists:', sanitizedArtists);
    setClickStatus(true);

    try {
      // Get Image Data
      const spotifyResponse = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/spotify`,
        { artists: sanitizedArtists },
        { headers: { 'Content-Type': 'application/json' } }
      );

      // Update the images if data exists
      const updatedImages = artists.map(
        (artist) => spotifyResponse.data[artist].imageUrl
      );
      setImageSrc(updatedImages);

      console.log(
        `Sending request to: , ${import.meta.env.VITE_BACKEND_URL}/TM`
      );

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

      console.log('🎟️ Ticketmaster API Response:', tmResponse);

      // Validate API responses before updating state
      if (!tmResponse.data || Object.keys(tmResponse.data).length === 0) {
        console.warn('⚠️ No events found, preventing empty state update.');
        setClickStatus(false);
        return;
      }

      const { artists, matches } = tmResponse.data;

      if (!artists || Object.keys(artists).length === 0) {
        console.warn('⚠️ No artist event data found.');
        setClickStatus(false);
        return;
      }

      console.log('Object structure:', Object.keys(tmResponse.data));

      if (!matches || matches.length === 0) {
        console.warn('⚠️ No matching events found.');
        setClickStatus(false);
        return;
      }

      // Update the intersect state if matches exist
      setTours(matches);

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
  }

  return (
    <div>
      <Nav setDays={setDays} setMiles={setMiles} />
      <div className='subMain-container'>
        <div className='artist-box'>
          <HarmonizerButton
            onClick={() => {
              harmonizeClickHandler();
            }}
          />
          {artists.map((artist, index) => (
            <Artists
              key={index}
              artistId={index}
              setInputArtist={(value) => updateArtist(index, value)}
              imageSrc={imageSrc[index] || placeholderImage1}
              artist={artist}
            />
          ))}
        </div>
        <div className='intersect'>
          {tours.length === 0 && clickStatus === false ? (
            <div>
              <p>See your two favorite artists in one city...</p>
            </div>
          ) : tours.length === 0 && clickStatus === true ? (
            <div>
              <p>💀 No results found...</p>
            </div>
          ) : (
            tours.map((event, index) => (
              <button
                key={index}
                className='intersect-button'
                onClick={() => {
                  setSiblingIntersect([event]);
                  window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'smooth',
                  });
                }}
              >
                {/* TODO: This needs to be converted to a table, I think. Sorted by highest # of overlapping artists */}
                {`${event.artists.join(', ')} at ${event.venue_name} on ${
                  event.event_date
                }`}
              </button>
            ))
          )}
        </div>
        <div className='map-container'>
          <Map siblingIntersect={siblingIntersect} tours={tours} />
        </div>
      </div>
    </div>
  );
}

export default App;
