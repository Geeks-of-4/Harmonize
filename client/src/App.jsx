import { useState, useEffect } from 'react';
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
  const [artist, setInputArtist] = useState(['', '']); 
  const [imageSrc, setImageSrc] = useState([placeholderImage1,placeholderImage2]);
  const [miles, setMiles] = useState(50);
  const [days, setDays] = useState(3);
  const [tours, setTours] = useState([]);
  const [siblingIntersect, setSiblingIntersect] = useState([]);


  async function harmonizeClickHandler() {
    try {
      await axios.post('http://localhost:9001/api', {
        artists: [artist[0], artist[1]]
      });
        
        
      
      
      const response1ExtractedData = extractDataFromApiResponse(response1.data);
      const response2ExtractedData = extractDataFromApiResponse(response2.data);
      const matchingEvents = findMatchingEvents(
        response1ExtractedData,
        response2ExtractedData,
        days,
        miles
      );
      setTours(matchingEvents);
      window.scrollBy({ top: 40, behavior: 'smooth' });
    }
    catch (err) {
      console.error("unable to fetch api from one or both artist",err);
    }
  }

  return (
    <div>
      <Nav daysWindow={setDays} milesWindow={setMiles} />
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
            imageSrc={imageSrc}
            artist={artist}
            className='left'
          />
          <Artists
            artistId={1}
            setInputArtist={setInputArtist}
            imageSrc={imageSrc}
            artist={artist}
            className='right'
          />
        </div>
        <div className='intersect'>
          {tours.map((group, index) => (
            <button
              key={index}
              className='intersect-button'
              onClick={() => setSiblingIntersect(group)}
            >
              {`${group.length} events in ${group[0].city}`}
            </button>
          ))}
        </div>
        <div className='map-container'>
          <Map siblingIntersect={siblingIntersect} tours={tours} />
        </div>
      </div>
    </div>
  );
}

export default App;