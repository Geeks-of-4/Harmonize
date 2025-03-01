import { useState } from 'react';
import './App.css';
import Artists from './components/Artists';
import Intersect from './components/Intersect';
import Map from './components/Map';
import Nav from './components/Nav';

function App() {
  return (
    <div>
      <Nav className='Nav'></Nav>
      <div className='subMain-container'>
        SUB MAIN CONTAINER
        <Map className='Map'></Map>
        <div className='artistsAndResults-container'>
          ARTISTS AND RESULTS
          <Artists className='Artist'></Artists>
          <Artists className='Artist'></Artists>
          <Intersect className='Intersect'></Intersect>
        </div>
      </div>
    </div>
  );
}

export default App;
