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
  const [artist, setInputArtist] = useState(['', '']); 
  const [imageSrc, setImageSrc] = useState([placeholderImage1,placeholderImage2]);
  const [miles, setMiles] = useState(50);
  const [days, setDays] = useState(3);
  const [tours, setTours] = useState([]);
  const [siblingIntersect, setSiblingIntersect] = useState([]);

  async function harmonizeClickHandler() {
    const apiKey = "K2UGwYuaehCHov5Edy6YkJiYUlmKXPRB"
    const artist1= artist[0];
    const artist2= artist[1];
    const timestamp = Date.now();
    const date = new Date(timestamp);
    const currentTime = date.toISOString();
    date.setMonth(date.getMonth() + 6)
    const sixMonthsLater = date.toISOString();
    const url1 = `https://cors-anywhere.herokuapp.com/https://app.ticketmaster.com/discovery/v2/events.json?keyword=${artist1}&startDateTime=${currentTime}&endDateTime=${sixMonthsLater}&apikey=${apiKey}`
    const url2 = `https://cors-anywhere.herokuapp.com/https://app.ticketmaster.com/discovery/v2/events.json?keyword=${artist2}&startDateTime=${currentTime}&endDateTime=${sixMonthsLater}&apikey=${apiKey}`
    try {
      const [response1,response2] = await Promise.all([
        axios.get(url1),
        axios.get(url2),
      ]);
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