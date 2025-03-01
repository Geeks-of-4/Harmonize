import { useState } from 'react';
import './App.css';
import Artists from './components/Artists';
import Intersect from './components/Intersect';
import Map from './components/Map';
import Nav from './components/Nav';

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
