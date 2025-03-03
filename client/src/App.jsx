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
  const [artist, setInputArtist] = useState([
    'Walker & Royce',
    'Sullivan King',
  ]);
  const [imageSrc, setImageSrc] = useState([
    placeholderImage1,
    placeholderImage2,
  ]);
  const [miles, setMiles] = useState(100);
  const [days, setDays] = useState(7);
  const [tours, setTours] = useState([]);

  const [siblingIntersect, setSiblingIntersect] = useState([]);

  async function harmonizeClickHandler() {
    try {
      const response = await axios.post(
        'http://localhost:9001/api/TM',
        [artist[0], artist[1]],
        { headers: { 'Content-Type': 'application/json' } }
      );

      //* response data should have images as well that we will need to reference to pull into setImageSrc 
      const data = response.data;
      const response1ExtractedData = await extractDataFromApiResponse(data.artist1);
      const response2ExtractedData = await extractDataFromApiResponse(data.artist2);
      const matchingEvents = findMatchingEvents(
        response1ExtractedData,
        response2ExtractedData,
        days,
        miles

      );
      setTours(matchingEvents);
      document.querySelector('.subMain-container').scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });

      //extract artist1 and artist2 from response.data
      const {image1, image2}= response.data;

      //* this should be good to go, once apiController is successfully receiving images
      setImageSrc([image1, image2])
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
            artist={artist}
            className='left'
          />
          <Artists
            artistId={1}
            setInputArtist={setInputArtist}
            imageSrc={imageSrc[1]}
            artist={artist}
            className='right'
          />
        </div>
        <div className='intersect'>
          {tours.length === 0 ? (
            <div>
              <p>See your two favorite artists in one city... </p>
              <p>Pick two artists and let's see if they meet up anywhere.</p>
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
