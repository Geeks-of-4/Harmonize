import { useEffect, useState } from 'react';
import './App.css';
import Map from './components/Map';
import Nav from './components/Nav';
import LeftArtist from './components/ArtistLeft';
import RightArtist from './components/ArtistRight';
import HarmonizerButton from './components/HarmonizerButton';
import { sanitizeInput } from './helpers/inputSanitizer';
import { fetchArtistImage } from './helpers/fetchArtistImage';
import { useDebouncedArtists } from './helpers/useDebouncedArtists';
import { harmonizeClickHandler } from './helpers/harmonizeClickHandler';

function App() {
  // User Inputs
  const [artists, setInputArtists] = useState(['', '']);
  const [miles, setMiles] = useState(100);
  const [days, setDays] = useState(7);

  // Custom Hook for Debounced Artists
  const debouncedArtists = useDebouncedArtists(artists);

  // Artist Images & Rotation
  const [artistImages, setArtistImages] = useState({});
  const [currentLeftArtist, setCurrentLeftArtist] = useState(null);
  const [prevLeftArtist, setPrevLeftArtist] = useState(null);
  const [currentRightArtist, setCurrentRightArtist] = useState(null);
  const [prevRightArtist, setPrevRightArtist] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationState, setAnimationState] = useState('paused');

  // Matched Events
  const [clickStatus, setClickStatus] = useState(false);
  const [tours, setTours] = useState([]);
  const [siblingIntersect, setSiblingIntersect] = useState([]);

  const updateArtist = (index, value) => {
    const sanitizedValue = sanitizeInput(value);

    setInputArtists((prevArtists) => {
      const updatedArtists = [...prevArtists];
      updatedArtists[index] = sanitizedValue;

      // Ensure 2-10 inputs dynamically appear
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

  useEffect(() => {
    debouncedArtists.forEach(async (artist) => {
      if (artist.trim() && !artistImages[artist]) {
        console.log(`Fetching image for debounced artist: ${artist}`); // ✅ Debugging log
        const imageUrl = await fetchArtistImage(artist);
        setArtistImages((prevImages) => ({
          ...prevImages,
          [artist]: imageUrl,
        }));
      }
    });
  }, [debouncedArtists]);

  // Rotate artists every 5 seconds
  useEffect(() => {
    if (debouncedArtists.length < 2) return;

    const transition = () => {
      setAnimationState('entering'); // 🛠️ Start entering first!

      setTimeout(() => {
        setAnimationState('exiting'); // 🛠️ Start exiting slightly later
        setCurrentIndex(
          (prevIndex) => (prevIndex + 2) % debouncedArtists.length
        );
      }, 250); // Exit now starts **AFTER** enter begins
    };

    const interval = setInterval(transition, 5000);
    return () => clearInterval(interval);
  }, [debouncedArtists]);

  // Update left and right artists whenever index changes
  useEffect(() => {
    setPrevLeftArtist(currentLeftArtist);
    setPrevRightArtist(currentRightArtist);

    setCurrentLeftArtist(debouncedArtists[currentIndex] || null);
    setCurrentRightArtist(
      debouncedArtists[(currentIndex + 1) % debouncedArtists.length] || null
    );
  }, [currentIndex, debouncedArtists]);

  return (
    <div>
      {/* Navigation Bar (Dropdowns for Days & Distance) */}
      <Nav setDays={setDays} setMiles={setMiles} />

      <div className='subMain-container'>
        {/* Artist Box - Contains Inputs & Displayed Artists */}
        <div className='artist-box'>
          {/* Harmonizer Button */}
          <HarmonizerButton
            onClick={() =>
              harmonizeClickHandler({
                artists,
                days,
                miles,
                setClickStatus,
                setTours,
                setSiblingIntersect,
              })
            }
          />

          {/* Display Left & Right Artists (Images & Names) */}
          <div className='artist-display'>
            <LeftArtist
              prevArtist={
                prevLeftArtist ? artistImages[prevLeftArtist] : null
              }
              currentArtist={
                currentLeftArtist ? artistImages[currentLeftArtist] : null
              }
              animationState={animationState}
            />
            <RightArtist
              prevArtist={
                prevRightArtist ? artistImages[prevRightArtist] : null
              }
              currentArtist={
                currentRightArtist ? artistImages[currentRightArtist] : null
              }
              animationState={animationState}
            />
          </div>

          {/* Overlaid Artist Inputs */}
          <div className='artist-inputs-overlay'>
            {artists.map((artist, index) => (
              <input
                key={index}
                type='text'
                value={artist}
                onChange={(event) => updateArtist(index, event.target.value)}
                placeholder="Enter artist's name"
                className='input'
              />
            ))}
          </div>
        </div>

        {/* Display Matching Events (Results Section) */}
        <div className='intersect'>
          {tours.length === 0 && !clickStatus ? (
            <p>See your two favorite artists in one city...</p>
          ) : tours.length === 0 && clickStatus ? (
            <p>💀 No results found...</p>
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
                {`${event.artists.join(', ')} at ${event.venue_name} on ${
                  event.event_date
                }`}
              </button>
            ))
          )}
        </div>

        {/* Map Display Section */}
        <div className='map-container'>
          <Map siblingIntersect={siblingIntersect} tours={tours} />
        </div>
      </div>
    </div>
  );
}

export default App;
