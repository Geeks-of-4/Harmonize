import React, { useEffect, useRef } from 'react';

function getAverageLatLng(array) {
  if (array.length === 0) return null;

  const total = array.reduce(
    (acc, { lat, lng }) => {
      acc.lat += lat;
      acc.lng += lng;
      return acc;
    },
    { lat: 0, lng: 0 }
  );

  return {
    lat: total.lat / array.length,
    lng: total.lng / array.length
  };
}

const Map = ({
  tours = [
    { lat: 32.782368, lng: -96.783813, title: 'Bomb Factory Deep Ellum' },
    { lat: 32.78511, lng: -96.808182, title: 'HOB Dallas' },
    { lat: 32.955978, lng: -96.768181, title: 'Stereo Live' }
  ],
  siblingIntersect = [
    { lat: 32.782368, lng: -96.783813, title: 'Bomb Factory Deep Ellum' },
    { lat: 32.78511, lng: -96.808182, title: 'HOB Dallas' },
    { lat: 32.955978, lng: -96.768181, title: 'Stereo Live' }
  ],
}) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(
    () => {
      const middleOfIntersect = getAverageLatLng(siblingIntersect);
      console.log(middleOfIntersect);

      async function loadMap() {
        // we are getting errors that the map is trying to render before it knows what it is, because google hasnt loaded yet
        if (!window.google || !mapRef.current) return; // so this line prevents that
        // import the google maps library, and then wait for it to save to the map object
        const { Map } = await window.google.maps.importLibrary('maps');
        const { AdvancedMarkerElement } = await window.google.maps.importLibrary('marker');
        // then update the map to show this spot by default (sydney aus, atm)
        mapInstance.current = new Map(mapRef.current, {
          center: { lat: middleOfIntersect.lat, lng: middleOfIntersect.lng }, // city
          zoom: 12,
          mapId: '30b4a168fe464cbe' 
        });
        // render the tours to the map for each artist
        tours.forEach(({ lat, lng, title }) => {
          new AdvancedMarkerElement({
            position: { lat, lng },
            map: mapInstance.current,
            title,
          });
        });
      }

      if (window.google && window.google.maps) {
        loadMap();
      } else {
        window.initMap = loadMap;
      }
    },
    [tours, siblingIntersect]
  );
  return <div ref={mapRef} id='map'></div>;
};

export default Map;

