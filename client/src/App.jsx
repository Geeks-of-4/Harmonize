import { useState } from 'react';
import axios from 'axios';
import Artists from './components/Artists';
import Map from './components/Map';
import Nav from './components/Nav';
import './App.css';
import { findMatchingEvents } from './helpers/findMatchingEvents';
import HarmonizerButton from './components/HarmonizerButton';
import placeholderImage1 from './assets/Placeholder1.webp';
import placeholderImage2 from './assets/Placeholder2.webp';
import { sanitizeInput } from './helpers/inputSanitizer';

function App() {
  const [clickStatus, setClickStatus] = useState(false);
  const [artists, setInputArtists] = useState(['carl cox', 'armin van buuren']);
  const [imageSrc, setImageSrc] = useState([
    placeholderImage1,
    placeholderImage2,
  ]);
  const [miles, setMiles] = useState(100);
  const [days, setDays] = useState(7);
  const [tours, setTours] = useState([]);
  const [siblingIntersect, setSiblingIntersect] = useState([]);

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
  async function harmonizeClickHandler() {
    // Exit early if no input data was given
    const sanitizedArtists = artists.map(sanitizeInput);
    if (sanitizedArtists.length < 2) return;
    console.log('🎤 Sanitized Artists:', sanitizedArtists);
    setClickStatus(true);

    try {
      // Get Image Data
      const spotifyResponse = await axios.post(
        `${API_BASE_URL}/spotify`,
        sanitizedArtists,
        { headers: { 'Content-Type': 'application/json' } }
      );

      // Update the images if data exists
      const updatedImages = artists.map(
        (artist) => spotifyResponse.data[artist]
      );
      setImageSrc(updatedImages);

      // Get Concert Data
      const tmResponse = await axios.post(
        `${API_BASE_URL}/TM`,
        sanitizedArtists,
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log('🎟️ Ticketmaster API Response:', tmResponse);

      // Validate API responses before updating state
      if (!tmResponse.data || Object.keys(tmResponse.data).length === 0) {
        console.warn('⚠️ No events found, preventing empty state update.');
        setClickStatus(false);
        return;
      }

      console.log('Object structure:', Object.keys(tmResponse.data));

      const artistEvents = Object.values(tmResponse.data)
        .filter((artist) => artist && artist.events) // Ensure valid data
        .map((artist) => artist.events);

      // Find matching events
      let matchingEvents = [];
      for (let i = 0; i < artistEvents.length - 1; i++) {
        for (let j = i + 1; j < artistEvents.length; j++) {
          const matches = findMatchingEvents(
            artistEvents[i],
            artistEvents[j],
            days,
            miles
          );
          matchingEvents.push(...matches);
        }
      }

      // Prevent empty state update
      if (matchingEvents.length === 0) {
        console.warn('⚠️ No matching events found.');
        setClickStatus(false);
        return;
      }

      // Update the intersect state if matches exist
      setTours(matchingEvents);

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
          {/* So this is what we would replace the code below with to be able to render more than 2 artists */}
          {/* {artists.map((artist, index) => (
            <Artists
              key={index}
              artistId={index}
              setInputArtist={setInputArtists}
              imageSrc={imageSrc[index] || placeholderImage1}
              artist={artist}
            />
          ))} */}
          <Artists
            artistId={0}
            setInputArtist={setInputArtists}
            imageSrc={imageSrc[0]}
            artist={artists[0]}
            className='left'
          />
          <Artists
            artistId={1}
            setInputArtist={setInputArtists}
            imageSrc={imageSrc[1]}
            artist={artists[1]}
            className='right'
          />
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
            tours.map((group, index) => (
              <button
                key={index}
                className='intersect-button'
                onClick={() => {
                  // console.log(group);
                  setSiblingIntersect(group);
                  window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'smooth',
                  });
                }}
              >
                {`${group.length} events in ${group[0].city}`}
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
