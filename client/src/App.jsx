// Import Libraries
import { useState } from 'react';
import axios from 'axios';
// Import Components & CSS
import Artists from './components/Artists';
import Intersect from './components/Intersect';
import Map from './components/Map';
import Nav from './components/Nav';
import './App.css';
// Import Helper Functions
import { extractDataFromApiResponse } from './helpers/extractDatesFromApiResponse';
import { findMatchingEvents } from './helpers/findMatchingEvents';
// Import our test data (remove this when the SPI is fixed)
//import apiResponseJSON from '../../ApiResponseExample.json';

function App() {
  // console.log('⛰️ Mounting App Component!');
  // This array contains two artist names, position 0 would be artist 1, while position 1 is artist 2
  const [artist, setInputArtist] = useState(['', '']); // fake placeholder data, we should remove this
  // This array contains the two artist images, for right now, I am putting placeholders from picsum.
  const [imageSrc, setImageSrc] = useState([
    placeholderImage1,
    placeholderImage2,
  ]);
  // This array contains the API responses from the ticketmaster API call
  const [eventData, setEventData] = useState([]);
  // This contains the miles limit specified by the user. Ive set the default to 50.
  // apiResponseJSON,
  // apiResponseJSON,
  const [miles, setMiles] = useState(50);
  // This contains the time limit in days specified by the user. Ive set the default to 3 days.
  const [days, setDays] = useState(3);
  // This array of arrays of objects contains the full set of matched tours that the matching function has returned.
  const [tours, setTours] = useState([]);
  // This contains the specific set of results the user wants to view on the map, this only tells the map to zoom to a spot.
  const [siblingIntersect, setSiblingIntersect] = useState([
    // This is dummy data, empty this when ready
    { lat: 32.782368, lng: -96.783813, title: 'Bomb Factory Deep Ellum' },
    { lat: 32.78511, lng: -96.808182, title: 'HOB Dallas' },
    { lat: 32.955978, lng: -96.768181, title: 'Stereo Live' },
  ]);

  // Spotify API Post Request for access token
  const client_id = 'b22f740260554be69bfbf430b78c5bdf';
  const client_secret = '8bf82ad9bdd948aab49569b15374f424';

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

      const accessToken = response.body.access_token;
      console.log('Access Token:', accessToken);
      return accessToken;
    
    } catch (error) {
      console.error('Error fetching POST request:', error.message);
    }

  }
  // Get Artist usign Search with Spotify API:
  async function getArtistBySearch(accessToken, artistName) {
    try {
      const response = await axios.get('https://api.spotify.com/v1/search?q={artist1}&type=artist', {
        headers: {
          Authorization: 'Bearer ' + accessToken
        }
      });
  
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error getting images:', error.message);
    }
  }

// const testUrl1 = 'https://app.ticketmaster.com/discovery/v2/events.json?keyword=Kendrick+Lamar&startDateTime=2025-03-01T00:00:00Z&endDateTime=2025-05-31T00:00:00Z&apikey=K2UGwYuaehCHov5Edy6YkJiYUlmKXPRB';
// const testUrl2 = 'https://app.ticketmaster.com/discovery/v2/events.json?keyword=Eminem&startDateTime=2025-03-01T00:00:00Z&endDateTime=2025-05-31T00:00:00Z&apikey=K2UGwYuaehCHov5Edy6YkJiYUlmKXPRB';
  async function harmonizeClickHandler() {
    console.log('👆 The Harmonizerizer has been Clickety Clacked.');
    //* ✅ const complete
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
    // ! The eventData useState should be updated after the API calls in here
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
    // console.log('Response 1 Extract: ',extractDataFromApiResponse(response1))
    // console.log('Response 2 Extract: ',extractDataFromApiResponse(response1))
    // Trigger matching events function... to find the matching events
    // ! The output of this function is an array of arrays full of objects
    // With test data, it looks like there are shitloads of duplicates. We need to check this console log w/ real data
  }

  return (
    <div>
      {/* This content should occupy 80% of the viewable area */}
      <Nav daysWindow={setDays} milesWindow={setMiles} />
      <div className='subMain-container'>
        <div className='artist-box'>
          <HarmonizerButton
            onClick={() => {
              harmonizeClickHandler();
            }}
            isToggled={harmonizerButtonActive}
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
        {/* this lil guy should occupy a static 20% */}
        <Intersect setSiblingIntersect={setSiblingIntersect} />

        {/* and then if you scroll down, this should occupy another 80% */}
        <div className='map-container'>
          <Map siblingIntersect={siblingIntersect} tours={tours} />
        </div>
      </div>
    </div>
  );
}

export default App;

/*
import dotenv from 'dotenv'; // Load API token
import path from 'path';
dotenv.config({ path: path.resolve('../server', '.env') });

import axios from 'axios'; // API requests
import Bottleneck from 'bottleneck'; // Rate limiting
import Repo from '../db.js'; // Database connection
import { getDateNDaysAgo } from './getDateNDaysAgo.js';

! Bottleneck rate limiter setup
console.log('⏳ Initializing rate limiter...');
const limiter = new Bottleneck({
  reservoir: 5000, // Available tokens
  reservoirRefreshAmount: 5000, // Tokens per reset
  reservoirRefreshInterval: 3600000, // Refresh interval (1 hour)
  minTime: 1000, // Min time between requests
  maxConcurrent: 1, // One request at a time
});
console.log('✅ Rate limiter configured.');

! Helper function for exponential backoff
function sleep(ms) {
  console.log(`⏸️ Sleeping for ${ms / 1000} seconds...`);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

! Helper function to update the limiter settings based on rate limit headers
function updateLimiterSettings(response) {
  console.log('🔄 Updating rate limiter settings based on API headers...');

  const remaining = parseInt(response.headers['x-ratelimit-remaining'], 10); // Extracts the number of remaining API calls
  const reset = parseInt(response.headers['x-ratelimit-reset'], 10) * 1000; // Retrieves the Unix timestamp (in seconds) when the rate limit resets
  const retryAfter = parseInt(response.headers['retry-after'], 10) * 1000 || 0; // Checks if GitHub enforces a temporary block due
  const now = Date.now();
  const timeUntilReset = reset - now; // Determines how long (in milliseconds) until GitHub resets

  console.log(
    `🛑 Remaining API calls: ${remaining}, Time until reset: ${
      timeUntilReset / 1000
    }s, Retry-After: ${retryAfter / 1000}s`
  );

  limiter.updateSettings({
    reservoir: remaining, // Limits the number of available API requests to whatever is remaining
    reservoirRefreshAmount: 5000, // We get 5k back on refresh
    reservoirRefreshInterval: timeUntilReset, // Resume after refresh
    minTime: retryAfter > 0 ? retryAfter : limiter.minTime, // Adjust minTime dynamically
  });
}

export async function fetchGitHubTrendingData(number) {
  console.log(
    `🚀 Fetching GitHub trending data from the past ${number} days...`
  );

  const startDate = getDateNDaysAgo(number);
  let page = 1;
  let rank = 1;

  while (true) {
    const url = `https://api.github.com/search/repositories?q=created:>${startDate}&sort=stars&order=desc&per_page=100&page=${page}`;
    console.log(`📡 Fetching data from: ${url}`);

    try {
      ! Make request with rate limiting
      const response = await limiter.schedule(() =>
        axios.get(url, {
          headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` },
        })
      );

      ! Update the limiter settings based on rate limit headers
      updateLimiterSettings(response);

      ! Process data
      console.log(`📊 Processing page ${page}...`);
      const parsedGitHubData = response.data.items.map((repo, index) => ({
        id: repo.id,
        rank: rank + index,
        name: repo.name,
        full_name: repo.full_name,
        html_url: repo.html_url,
        owner: {
          login: repo.owner.login,
          avatar_url: repo.owner.avatar_url,
          html_url: repo.owner.html_url,
        },
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        open_issues_count: repo.open_issues_count,
        language: repo.language,
        created_at: repo.created_at,
        updated_at: repo.updated_at,
        description: repo.description,
      }));

      ! Increment rank for next batch
      rank += parsedGitHubData.length;

      console.log(
        `📦 Page ${page}: Processed ${parsedGitHubData.length} repositories.`
      );

      ! Save to database
      console.log(
        `🏪 Page ${page}: Updating database with ${parsedGitHubData.length} results.`
      );

      ! TODO we are only writing to the database, at some point we need to clear old data
      await Repo.bulkWrite(
        parsedGitHubData.map((repo) => ({
          updateOne: {
            filter: { id: repo.id },
            update: { $set: repo },
            upsert: true,
          },
        }))
      );

      ! Stop if fewer than 100 results
      if (parsedGitHubData.length < 100 || page === 10) {
        console.log(
          '🔚 Fewer than 100 results returned OR page 10 reached. Stopping pagination.'
        );
        break;
      }
      page++;
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.error('⏳ Rate limit exceeded. Retrying...');
        const retryAfter =
          parseInt(error.response.headers['retry-after'], 10) * 1000 || 60000; // Default to 60s
        await sleep(retryAfter);
      } else {
        console.error('☠️ API Error:', {
          Status: error.response?.status || 'Unknown',
          Code: error.code || 'Unknown',
        });
        break; // Exit if it's not a rate limit error
      }
    }
  }

  console.log('✅ GitHub trending data fetch complete.');
}

*/
