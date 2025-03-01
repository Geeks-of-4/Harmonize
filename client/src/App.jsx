import { useState } from 'react';
import './App.css';
import Artists from './components/Artists';
import Intersect from './components/Intersect';
import Map from './components/Map';
import Nav from './components/Nav';

function App() {
  return (
    <div className='main-container'>
      <Nav className='Nav' />
      <div className='subMain-container'>
        <Map className='Map' />
        <div className='artistsAndResults-container'>
          <div className='artists-container'>
            <Artists className='Artist' />
            <Artists className='Artist' />
          </div>
          <Intersect className='Intersect' />
        </div>
      </div>
    </div>
  );
}

export default App;
