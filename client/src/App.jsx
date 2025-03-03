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
  const [imageSrc, setImageSrc] = useState(['', '']);
  const [miles, setMiles] = useState(100);
  const [days, setDays] = useState(7);
  const [tours, setTours] = useState([]);
  // This contains the specific set of results the user wants to view on the map, this only tells the map to zoom to a spot.
  const [siblingIntersect, setSiblingIntersect] = useState([
    // This is dummy data, empty this when ready
    { lat: 32.782368, lng: -96.783813, title: 'Bomb Factory Deep Ellum' },
    { lat: 32.78511, lng: -96.808182, title: 'HOB Dallas' },
    { lat: 32.955978, lng: -96.768181, title: 'Stereo Live' },
  ]);
  const [harmonizerButtonActive, setHarmonizerButtonActive] = useState(false);



  // Spotify API Post Request for access token
  const client_id = 'b22f740260554be69bfbf430b78c5bdf';
  const client_secret = '8bf82ad9bdd948aab49569b15374f424';
  const accessToken = {
    "access_token": "BQAap0nXlZH_CEGMKLCjupPuBHqyZ8rI9IDY50scVTAROUvw44Vl5D684mEET-CRM-nCjuSy0CZGk_RjNKI6T82IBBGaRNeSUu32tZxGyTHyAg6gq7Q5zCYSwzFZ-AroqafYzSCi6hM",
    "token_type": "Bearer",
    "expires_in": 3600
  }

const isTokenExpired = () => {
  const expiresAt = localStorage.getItem('token_expiry');
  const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
  return !expiresAt || currentTime > expiresAt;  // Token is expired if expiresAt is null or currentTime > expiresAt
};
  // First-time load or when there's no valid token, call getToken
  if (!localStorage.getItem('access_token') || isTokenExpired()) {
    getToken();  // This will fetch and store a new token if it doesn't exist or has expired
  }
  
  // Axios interceptor to check if the token is expired or missing and refresh if necessary
axios.interceptors.request.use(
  async (config) => {
    let accessToken = localStorage.getItem('access_token');
    
    // If there's no access token or the token is expired
    if (!accessToken || isTokenExpired()) {
      console.log('Token expired or not found, fetching a new token...');
      
      try {
        // If the token is missing, get a new one
        if (!accessToken) {
          accessToken = await getToken();
        } else {
          // If the token expired, refresh it
          accessToken = await refreshAccessToken();
        }
      } catch (error) {
        console.error('Failed to refresh the access token:', error);
        throw error; // Stop request if token cannot be retrieved
      }
    }
    
    // Attach the valid token to the request
    config.headers['Authorization'] = 'Bearer ' + accessToken;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

  async function getToken() {
    try {
      const response = await axios.post('https://accounts.spotify.com/api/token',
        new URLSearchParams({
          'grant_type': 'client_credentials',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(client_id + ':' + client_secret),
          },
        });

      const accessToken = response.data.access_token;
      const tokenType = response.data.token_type;
      const expiresIn = response.data.expires_in;
    
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('token_type', tokenType);
      localStorage.setItem('expires_in', expiresIn);

       // Set the expiration time in localStorage (current time + expiresIn)
      localStorage.setItem('token_expiry', Math.floor(Date.now() / 1000) + expiresIn);

      return accessToken;
    
    } catch (error) {
      console.error('Failed to fetch token:', error.message);
    }
  };

  // Function to refresh the token
const refreshAccessToken = async () => {
  try {
    const response = await axios.post('https://accounts.spotify.com/api/token',
      new URLSearchParams({
        'grant_type': 'client_credentials',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(client_id + ':' + client_secret),
        },
      });

    const accessToken = response.data.access_token;
    const tokenType = response.data.token_type;
    const expiresIn = response.data.expires_in;

    // Store the new token and its expiry time
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('token_type', tokenType);
    localStorage.setItem('expires_in', expiresIn);
    
    // Set the expiration time in localStorage
    localStorage.setItem('token_expiry', Math.floor(Date.now() / 1000) + expiresIn);

    return accessToken;
  } catch (error) {
    console.error('Error refreshing access token:', error.message);
    throw error;
  }
};
  
  async function getArtistBySearch(accessToken, artist1 , artist2) {
    //const accessToken = localStorage.getItem('access_token');
    try {
      const [response1, response2] = await Promise.all([
        axios.get(`https://api.spotify.com/v1/search?q=${artist1}&type=artist`, {
          headers: {
            Authorization: 'Bearer ' + accessToken
          }
        }),
        axios.get(`https://api.spotify.com/v1/search?q=${artist2}&type=artist`, {
          headers: {
            Authorization: 'Bearer ' + accessToken
          }
        })
      ]);
      
      console.log(artist.images[0].url);
      const imageSrc1 = response1.data.artist.images[0].url || '';  // fallback to empty string if no image is found
      const imageSrc2 = response2.data.artist.images[0].url || '';
      setImageSrc([[imageSrc1], [imageSrc2]]);
    } catch (error) {
      console.error('Error getting images:', error.message);
    }
  }


  async function harmonizeClickHandler() {
    console.log('👆 The Harmonizerizer has been Clickety Clacked.');
    // make the button do a cool animation
    setHarmonizerButtonActive(!harmonizerButtonActive);
    // scroll the user below the nav bar
    window.scrollBy({ top: 40, behavior: 'smooth' });

    const apiKey = "K2UGwYuaehCHov5Edy6YkJiYUlmKXPRB"
    const artist1= artist[0];
    const artist2= artist[1];
    const timestamp = Date.now();
    const date = new Date(timestamp);
    const currentTime = date.toISOString();
    date.setMonth(date.getMonth() + 6)
    const sixMonthsLater = date.toISOString();
    //need to put artist string in url

    const url1 = `https://app.ticketmaster.com/discovery/v2/events.json?keyword=${artist1}&startDateTime=${currentTime}&endDateTime=${sixMonthsLater}&apikey=${apiKey}`
    const url2 = `https://app.ticketmaster.com/discovery/v2/events.json?keyword=${artist2}&startDateTime=${currentTime}&endDateTime=${sixMonthsLater}&apikey=${apiKey}`
    //chatgpt said to use promise.all since it only returns when both are fulfilled.
    try {
      const [response1,response2] = await Promise.all([
        axios.get(url1),
        axios.get(url2),
      ]);

      // console.log ("res1: " + res1.data)
      // console.log ("res2: " + res2.data)
       //use .data provided by axioswhich contains a res body (axios methods includes .stats .statusText .headers .config .data)
      // const res1Data = extractDataFromApiResponse(res1.data);
      // const res2Data = extractDataFromApiResponse(res2.data);
      //const response1 = eventData[0]; // Swap this static JSON response out for the actual API response for artist 1
      //const response2 = eventData[1]; // Swap this static JSON response out for the actual API response for artist 2
      const response1ExtractedData = extractDataFromApiResponse(response1.data);
      const response2ExtractedData = extractDataFromApiResponse(response2.data);
      
      
      console.log('👑 Proximal Events: ', matchingEvents);
      // Update the list of tours with those matching events
      
      const matchingEvents = findMatchingEvents(
        response1ExtractedData,
        response2ExtractedData,
        days,
        miles
      );

      setTours(matchingEvents);
      
      // const matchingEvents = findMatchingEvents(res1Data, res2Data);
       setEventData([response1.data,response2.data]);
    }
    catch (err){
      console.error("unable to fetch api from one or both artist",err);
    }

    // Build API fetch for ticketmaster
    // const date1 = ;
    // const date2 = ;
    // *After the API CALL for both artists, you should run this line below:
    // *setEventData([apiResults1, apiResults2])

    // Simulate two separate API responses
    const response1Image = 'https://picsum.photos/200'; // the response image for artist 1 would go here
    const response2Image = 'https://picsum.photos/200'; // the response image for artist 2 would go here
    console.log('🫨 API Response Data Loaded.');
    // Update the images for both artists (you could put the API's image location here instead)
    setImageSrc([[response1Image], [response2Image]]);
    console.log('📷 Artist Images Updated.');
    // Extract event dates




    // ! >>> PUT API HERE<<<
    // ! The eventData useState should be updated after the API calls in here
    // const apiKey = "K2UGwYuaehCHov5Edy6YkJiYUlmKXPRB"
    // const testUrl =
    //   'https://app.ticketmaster.com/discovery/v2/events.json?keyword=Kendrick+Lamar&startDateTime=2025-03-01T00:00:00Z&endDateTime=2025-05-31T00:00:00Z&apikey=K2UGwYuaehCHov5Edy6YkJiYUlmKXPRB';
    // 2025-03-01T00:00:00Z
    // takes time in ms, this should give the time in the correct format
    // const timestamp = Date.now();
    // const date = new Date(timestamp);
    // const currentTime = date.toISOString();
    // date.setMonth(date.getMonth() + 6)
    // const sixMonthsLater = date.toISOString();
    // const url = `https://app.ticketmaster.com/discovery/v2/events.json?keyword=Eagles&startDateTime=${currentTime}&endDateTime=${sixMonthsLater}&apikey=${apiKey}`
    // Build API fetch for ticketmaster
    // const artist1='';
    // const artist2='';
    // const date1 = ;
    // const date2 = ;
    // *After the API CALL for both artists, you should run this line below:
    // *setEventData([apiResults1, apiResults2])

    // Simulate two separate API responses
    const response1 = eventData[0]; // Swap this static JSON response out for the actual API response for artist 1
    const response2 = eventData[1]; // Swap this static JSON response out for the actual API response for artist 2
    const response1Image =
      'https://variety.com/wp-content/uploads/2017/11/kendrick-lamar-variety-hitmakers.jpg?w=1000&h=562&crop=1&resize=910%2C511'; // the response image for artist 1 would go here
    const response2Image =
      'https://www.billboard.com/wp-content/uploads/2024/06/Eminem-press-credit-Travis-Shinn-2024-billboard-1548.jpg?w=942&h=623&crop=1&resize=942%2C623'; // the response image for artist 2 would go here
    console.log('🫨 API Response Data Loaded.');
    // Update the images for both artists (you could put the API's image location here instead)
    setImageSrc([[response1Image], [response2Image]]);
    console.log('📷 Artist Images Updated.');
    // Extract event dates
    const response1ExtractedData = extractDataFromApiResponse(response1);
    const response2ExtractedData = extractDataFromApiResponse(response2);
    // console.log('Response 1 Extract: ',extractDataFromApiResponse(response1))
    // console.log('Response 2 Extract: ',extractDataFromApiResponse(response1))
    // Trigger matching events function... to find the matching events
    const matchingEvents = findMatchingEvents(
      response1ExtractedData,
      response2ExtractedData,
      days,
      miles
    );
    // ! The output of this function is an array of arrays full of objects
    // With test data, it looks like there are shitloads of duplicates. We need to check this console log w/ real data
    // console.log('👑 Proximal Events: ', matchingEvents);
    // Update the list of tours with those matching events
    setTours(matchingEvents);
  }

  return (
    <div>
      <Nav setDays={setDays} setMiles={setMiles} />
      <div className='subMain-container'>
        <div className='artist-box'>
          <HarmonizerButton
            onClick={() => {
              getToken();
              harmonizeClickHandler();
              getArtistBySearch();
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
