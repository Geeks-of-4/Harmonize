// Just about all of the business logic is run from this page. This one component houses all others,
// as there was no need to do nested components. As a result, this object is the state controller, and it has many.
// Notably, because we do not sanitize the artist input, its totally possible that spotify displays one artists image
// while the ticket master results displays concerts for someone else entirely.
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
  const [artist, setInputArtist] = useState(['carl cox', 'armin van buuren']);
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
    const sanitizedArtists = artist.map(sanitizeInput);
    if (!sanitizedArtists[0] || !sanitizedArtists[1]) return;
    console.log('🎤 Sanitized Artists:', sanitizedArtists);
    setClickStatus(true);

    try {
      // Get Image Data
      const spotifyResponse = await axios.post(
        `${API_BASE_URL}/spotify`,
        [sanitizedArtists[0],sanitizedArtists[1]],
        { headers: { 'Content-Type': 'application/json' } }
      );

      // Update the images if data exists
      const { image1, image2 } = spotifyResponse.data;

      setImageSrc([image1, image2]);

      // Get Concert Data
      const tmResponse = await axios.post(
        `${API_BASE_URL}/TM`,
        [sanitizedArtists[0],sanitizedArtists[1]],
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log('🎟️ Ticketmaster API Response:', tmResponse.data);

      // Validate API responses before updating state
      if (
        !tmResponse.data.artist1?._embedded?.events?.length &&
        !tmResponse.data.artist2?._embedded?.events?.length
      ) {
        console.warn('⚠️ No events found, preventing empty state update.');
        setClickStatus(false);
        return;
      }

      console.log("Object structure:", Object.keys( tmResponse.data.artist1));

      // Find matching events
      const matchingEvents = findMatchingEvents(
        tmResponse.data.artist1,
        tmResponse.data.artist2,
        days,
        miles
      );
      
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
          <Artists
            artistId={0}
            setInputArtist={setInputArtist}
            imageSrc={imageSrc[0]}
            artist={artist[0]}
            className='left'
          />
          <Artists
            artistId={1}
            setInputArtist={setInputArtist}
            imageSrc={imageSrc[1]}
            artist={artist[1]}
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
