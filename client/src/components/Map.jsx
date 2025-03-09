import React, { useEffect, useRef } from 'react';

const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const googleMapsMapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;

const loadGoogleMapsScript = (callback) => {
  if (window.google && window.google.maps) {
    callback();
    return;
  }

  if (document.querySelector('script[src*="maps.googleapis.com"]')) {
    document
      .querySelector('script[src*="maps.googleapis.com"]')
      .addEventListener('load', callback);
    return;
  }

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
  script.async = true;
  script.defer = true;
  script.onload = () => {
    if (window.google && window.google.maps) {
      callback();
    } else {
      console.error('Google Maps failed to load.');
    }
  };
  document.head.appendChild(script);
};

const Map = ({ tours, siblingIntersect }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    loadGoogleMapsScript(() => {
      if (!window.google || !mapRef.current) return;

      const { Map, InfoWindow, LatLngBounds, Marker } = window.google.maps;

      mapInstance.current = new Map(mapRef.current, {
        center: { lat: 39.661, lng: -95.699 },
        zoom: 4,
        mapId: googleMapsMapId,
      });

      if (tours.length === 0) return;

      const bounds = new LatLngBounds();
      const infoWindow = new InfoWindow();

      tours
        .flat()
        .forEach(
          ({ artist, event_date, venue_name, city, lat, lng, ticket_url }) => {
            const position = { lat: parseFloat(lat), lng: parseFloat(lng) };
            const marker = new Marker({
              position,
              map: mapInstance.current,
            });
            const contentString = `
              <div style="font-family: 'Anton', sans-serif; background-color: #19002e; color: #ccc; border-radius: 8px; max-width: 250px; text-align: center;">
              <span style="letter-spacing: 1px; font-size: 1.4rem;">${artist}</span><br>
              <span style="font-size: 1rem;">${event_date}</span><br>
              <span style="font-size: 0.9rem;">${venue_name}</span><br>
              <span style="font-size: 0.9rem;">${city || ''}</span><br>
              <a href="${ticket_url}" target="_blank" style="display:inline-block; margin-top: 8px; background: #4a0072; color: white; padding: 8px 12px; text-decoration: none; border-radius: 5px; transition: background 0.3s;">
              Buy Tickets</a></div>`;

            marker.addListener('click', () => {
              infoWindow.setContent(contentString);
              infoWindow.open(mapInstance.current, marker);
            });

            bounds.extend(position);
          }
        );

      if (!bounds.isEmpty()) {
        mapInstance.current.fitBounds(bounds);
      }
    });
  }, [tours]);

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
