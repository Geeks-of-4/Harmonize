import { useState } from 'react';
import './App.css';
import Artists from './components/Artists';
import Intersect from './components/Intersect';
import Map from './components/Map';
import Nav from './components/Nav';
const axios = require ('axios');

const apiKey = "K2UGwYuaehCHov5Edy6YkJiYUlmKXPRB"
//https://app.ticketmaster.com/discovery/v2/events.json?keyword=Kendrick+Lamar&startDateTime=2025-03-01T00:00:00Z&endDateTime=2025-08-31T00:00:00Z&apikey=K2UGwYuaehCHov5Edy6YkJiYUlmKXPRB

const url = `https://app.ticketmaster.com/discovery/v2/events.json?keyword=Eagles&startDateTime=2025-03-01T00:00:00Z&endDateTime=2025-08-31T00:00:00Z&apikey=${apiKey}`

const artist1='';
const artist2='';

function App() {




  return (
    <div>
      <Nav />
      <div className='subMain-container'>
        <div className='artistsAndResults-container'>
          <div className='artist-box'>
            <Artists />
            <Artists />
          </div>
          <Intersect />
        </div>
        <Map />
      </div>
    </div>
  );
}

export default App;
