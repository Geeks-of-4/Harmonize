import React, { useEffect, useRef } from 'react';

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
      const { Map, InfoWindow } = await window.google.maps.importLibrary(
        'maps'
      );
      const { AdvancedMarkerElement } = await window.google.maps.importLibrary(
        'marker'
      );
      const { LatLngBounds } = await window.google.maps.importLibrary('core');

      // then update the map to show this spot by default (sydney aus, atm)
      mapInstance.current = new Map(mapRef.current, {
        center: { lat: 39.66118664405381, lng: -95.69956654456912 }, // center of US to start
        zoom: 4, // show all of USA
        mapId: 'c9801136fa90cb36',
      });

      // * This sections is used to center the map on the results from the API fetch.
      // If tours are empty, do not proceed
      if (tours.length === 0) return;
      // we creating a bounds object to contain the outer bounds of the markers
      const bounds = new LatLngBounds();
      const infoWindow = new InfoWindow();
      // render the tours to the map for each artist
      tours
        .flat()
        .forEach(
          ({ artist, event_date, venue_name, city, lat, lng, ticket_url }) => {
            // convert the string data to float decimals
            const position = { lat: parseFloat(lat), lng: parseFloat(lng) };
            // console.log('📍 Map Markers Updated!')
            const marker = new AdvancedMarkerElement({
              position,
              map: mapInstance.current,
            });
            // SO google is fucking dumb, and we have to give the marker all of the style data it needs to render in HTML, from here.
            const contentString = `
              <div style="
                font-family: 'Anton', sans-serif; 
                background-color: #19002e; 
                color: #ccc;  
                border-radius: 8px; 
                max-width: 250px; 
                text-align: center;
                padding-bottom: 40px;
                padding-right: 10px;
              ">
                <span style="letter-spacing: 1px; font-size: 1.4rem;">${artist}</span><br>
                <span style="font-size: 1rem;">${event_date}</span><br>
                <span style="font-size: 0.9rem;">${venue_name}</span><br>
                <span style="font-size: 0.9rem;">${city || ''}</span><br>
                <a href="${ticket_url}" target="_blank" 
                  style="
                    display:inline-block; 
                    margin-top: 8px; 
                    background: #4a0072; 
                    color: white; 
                    padding: 8px 12px; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    transition: background 0.3s ease-in-out;
                    letter-spacing: 1px;
                  " 
                  onmouseover="this.style.background='#6d3782'" 
                  onmouseout="this.style.background='#4a0072'">
                  Buy Tickets
                </a>
              </div>
            `;

            // add an event listener to each marker in order to render a render window.
            marker.addListener('gmp-click', () => {
              infoWindow.setContent(contentString);
              infoWindow.open({
                anchor: marker,
                map: mapInstance.current,
              });
            });
            // each time we add a point we extend the outer boundary
            bounds.extend(position);
          }
        );
      // then we fit the map to show all markers (but not if we skipped adding markers, like when tours is empty)
      if (!bounds.isEmpty()) {
        mapInstance.current.fitBounds(bounds);
      }
    }
    loadMap();
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
