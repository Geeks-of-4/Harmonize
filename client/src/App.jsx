import { useState } from 'react';
import './App.css';
import Artists from './components/Artists';
import Intersect from './components/Intersect';
import Map from './components/Map';
import Nav from './components/Nav';

function App() {
  return (
   <div>
    <Artists></Artists>
    <Intersect></Intersect>
    <Map></Map>
    <Nav></Nav>
   </div>
  )
}

export default App
