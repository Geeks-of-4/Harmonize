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
import { extractDataFromApiResponse } from './helpers/extractDatesFromApiResponse';
import { findMatchingEvents } from './helpers/findMatchingEvents';
import HarmonizerButton from './components/HarmonizerButton';
import placeholderImage1 from './assets/Placeholder1.webp';
import placeholderImage2 from './assets/Placeholder2.webp';

function App() {
  // State that controls "No Results Found" message in the Intersect box. (Not working as expected)
  const [clickStatus, setClickStatus] = useState(false);
  // State that receives input from the artist search boxes.
  const [artist, setInputArtist] = useState(['', '']);
  // State that receives input from the spotify image search. It is probably smarter to move the 
  // placeholders into the artist component itself instead of keeping it here.
  const [imageSrc, setImageSrc] = useState([
    placeholderImage1,
    placeholderImage2,
  ]);
  // State that receives input from the nav bar max miles range.
  const [miles, setMiles] = useState(100);
  // State that receives input from the nav bar max days between events range.
  const [days, setDays] = useState(7);
  // State that receives the combined output of the Ticket Master api fetch AFTER 
  // it's processed by the extractor helper function
  const [tours, setTours] = useState([]);
  // State that receives the selected event from the intersect table, 
  // which focuses the map on a selected event.
  const [siblingIntersect, setSiblingIntersect] = useState([]);

  // Nothing on the page happens until you click the harmonize button. 
  // Then all hell breaks loose. This triggers 2 api calls to ticket master,
  // 2 api calls to spotify, sometimes 30+ calls to google maps api.
  // notably there is no need to store data (because its not relevant as time moves on) 
  // so every click generates results on demand. 
  async function harmonizeClickHandler() {
    if (!artist[0] || !artist[1]) return;
    setClickStatus(true);
    try {
      // Get Image Data
      const spotifyResponse = await axios.post(
        'http://localhost:9001/api/spotify',
        [artist[0], artist[1]],
        { headers: { 'Content-Type': 'application/json' } }
      );
      // Update the images
      const { image1, image2 } = spotifyResponse.data;
      setImageSrc([image1, image2]);
      // Get Concert Data
      const tmResponse = await axios.post(
        'http://localhost:9001/api/TM',
        [artist[0], artist[1]],
        { headers: { 'Content-Type': 'application/json' } }
      );
      // Extract the relevant data from the API response
      const data = tmResponse.data;
      const response1ExtractedData = await extractDataFromApiResponse(
        data.artist1
      );
      const response2ExtractedData = await extractDataFromApiResponse(
        data.artist2
      );
      // Find the intersect
      const matchingEvents = findMatchingEvents(
        response1ExtractedData,
        response2ExtractedData,
        days,
        miles
      );
      // Update the intersect 
      setTours(matchingEvents);
      // Force scrolling to hide the nav, so that the results table is fully visible.
      document.querySelector('.subMain-container').scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });
    } catch (err) {
      console.error('unable to fetch api from one or both artist', err);
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
                  console.log(group);
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
