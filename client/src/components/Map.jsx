import React, { useEffect, useRef } from 'react';

// ! This code is no longer used, since I found that we can use marker boundaries to set map container edges
// function getAverageLatLng(array) {
//   // console.log('🥱 Get Average Lat/Long Invoked.');
//   if (array.length === 0) return null;

//   const total = array.reduce(
//     (acc, { lat, lng }) => {
//       acc.lat += lat;
//       acc.lng += lng;
//       return acc;
//     },
//     { lat: 0, lng: 0 }
//   );

//   return {
//     lat: total.lat / array.length,
//     lng: total.lng / array.length,
//   };
// }

const Map = ({ tours, siblingIntersect }) => {
  // console.log('🗺️ Mounting Map Component!');
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  // * This useEffect is used to create the initial map, and update it based on an API response
  useEffect(() => {
    // console.log('🚶‍♀️‍➡️ Map Use Effect Updated.')
    async function loadMap() {
      // console.log('📦 Load Map Async Function Invoked.')
      // we are getting errors that the map is trying to render before it knows what it is, because google hasnt loaded yet
      if (!window.google || !mapRef.current) return; // so this line prevents that
      // import the google maps library, and then wait for it to save to the map object
      const { Map } = await window.google.maps.importLibrary('maps');
      const { AdvancedMarkerElement } = await window.google.maps.importLibrary(
        'marker'
      );
      const { LatLngBounds } = await window.google.maps.importLibrary('core');
      // Dark Mode Style
      const darkModeStyle = [
        { elementType: 'geometry', stylers: [{ color: '#212121' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
        {
          featureType: 'administrative.locality',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#bdbdbd' }],
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{ color: '#373737' }],
        },
        {
          featureType: 'road',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#8a8a8a' }],
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#000000' }],
        },
        {
          featureType: 'water',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#3d3d3d' }],
        },
      ];

      // then update the map to show this spot by default (sydney aus, atm)
      mapInstance.current = new Map(mapRef.current, {
        center: { lat: 39.66118664405381, lng: -95.69956654456912 }, // center of US to start
        zoom: 4, // show all of USA
        styles: darkModeStyle,
        mapId: '30b4a168fe464cbe',
      });

      // * This sections is used to center the map on the results from the API fetch.
      // If tours are empty, do not proceed
      if (tours.length === 0) return;
      // we creating a bounds object to contain the outer bounds of the markers
      const bounds = new LatLngBounds();
      // render the tours to the map for each artist
      tours.flat().forEach(({ lat, lng, title }) => {
        // convert the string data to float decimals
        const position = { lat: parseFloat(lat), lng: parseFloat(lng) };
        // console.log('📍 Map Markers Updated!')
        new AdvancedMarkerElement({
          position,
          map: mapInstance.current,
          title,
        });
        // each time we add a point we extend the outer boundary
        bounds.extend(position);
      });
      // then we fit the map to show all markers (but not if we skipped adding markers, like when tours is empty)
      if (!bounds.isEmpty()) {
        mapInstance.current.fitBounds(bounds);
      }
    }

    // if (window.google && window.google.maps) {
    loadMap();
    //   // console.log('🏞️ Map Loaded.')
    // } else {
    //   window.initMap = loadMap;
    // }
  }, [tours]);

  // * This useEffect is used to update the map zoom based on a click on the results table
  useEffect(() => {
    if (!mapInstance.current || siblingIntersect.length === 0) return;

    const { LatLngBounds } = window.google.maps;
    const bounds = new LatLngBounds();

    siblingIntersect.forEach(({ lat, lng }) => {
      bounds.extend({ lat: parseFloat(lat), lng: parseFloat(lng) });
    });

    mapInstance.current.fitBounds(bounds);

    setTimeout(() => {
      if (mapInstance.current.getZoom() > 14) {
        mapInstance.current.setZoom(14);
      }
    }, 500);
  }, [siblingIntersect]);

  return <div ref={mapRef} id='map'></div>;
};

export default Map;
