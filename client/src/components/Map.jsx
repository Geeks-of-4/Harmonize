/**
 * Map Component
 * 
 * Displays an interactive Google Maps visualization of concert locations.
 * Handles marker creation, info windows, and map bounds for both all tours
 * and selected sibling intersections.
 * 
 * @param {Array} tours - Array of concert tour data including location and event details
 * @param {Array} siblingIntersect - Array of selected concert locations to focus on
 */

import React, { useEffect, useRef } from 'react';

// Load environment variables for Google Maps configuration
const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const googleMapsMapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;

/**
 * Loads the Google Maps JavaScript API script
 * @param {Function} callback - Function to execute once the script is loaded
 */
const loadGoogleMapsScript = (callback) => {
  // If Google Maps is already loaded, execute callback immediately
  if (window.google && window.google.maps) {
    callback();
    return;
  }

  // If script is already being loaded, add load event listener
  if (document.querySelector('script[src*="maps.googleapis.com"]')) {
    document
      .querySelector('script[src*="maps.googleapis.com"]')
      .addEventListener('load', callback);
    return;
  }

  // Create and append new script element
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

  // Initialize map and create markers for all tours
  useEffect(() => {
    loadGoogleMapsScript(() => {
      if (!window.google || !mapRef.current) return;

      const { Map, InfoWindow, LatLngBounds, Marker } = window.google.maps;

      // Initialize map with default center and zoom
      mapInstance.current = new Map(mapRef.current, {
        center: { lat: 39.661, lng: -95.699 },
        zoom: 4,
        mapId: googleMapsMapId,
      });

      if (tours.length === 0) return;

      const bounds = new LatLngBounds();
      const infoWindow = new InfoWindow();

      // Create markers for each tour location
      tours
        .flat()
        .forEach(
          ({ artists, event_date, venue_name, city, lat, lng, ticket_url }) => {
            const position = { lat: parseFloat(lat), lng: parseFloat(lng) };
            const marker = new Marker({
              position,
              map: mapInstance.current,
            });

            // Format artist names for display
            const artistNames = Array.isArray(artists) && artists.length > 0 
            ? artists.join(', ') 
            : 'Unknown Artists';

            // Create HTML content for info window
            const contentString = `
              <div style="font-family: 'Anton', sans-serif; background-color: #19002e; color: #ccc; border-radius: 8px; max-width: 250px; text-align: center;">
              <span style="letter-spacing: 1px; font-size: 1.4rem;">${artistNames}</span><br>
              <span style="font-size: 1rem;">${event_date}</span><br>
              <span style="font-size: 0.9rem;">${venue_name}</span><br>
              <span style="font-size: 0.9rem;">${city || ''}</span><br>
              <a href="${ticket_url}" target="_blank" style="display:inline-block; margin-top: 8px; background: #4a0072; color: white; padding: 8px 12px; text-decoration: none; border-radius: 5px; transition: background 0.3s;">
              Buy Tickets</a></div>`;

            // Add click listener to show info window
            marker.addListener('click', () => {
              infoWindow.setContent(contentString);
              infoWindow.open(mapInstance.current, marker);
            });

            bounds.extend(position);
          }
        );

      // Fit map bounds to show all markers
      if (!bounds.isEmpty()) {
        mapInstance.current.fitBounds(bounds);
      }
    });
  }, [tours]);

  // Handle focus on selected sibling intersections
  useEffect(() => {
    if (!mapInstance.current || siblingIntersect.length === 0) return;

    const { LatLngBounds } = window.google.maps;
    const bounds = new LatLngBounds();

    // Extend bounds to include all selected locations
    siblingIntersect.forEach(({ lat, lng }) => {
      bounds.extend({ lat: parseFloat(lat), lng: parseFloat(lng) });
    });

    // Fit map to selected locations
    mapInstance.current.fitBounds(bounds);

    // Limit maximum zoom level
    setTimeout(() => {
      if (mapInstance.current.getZoom() > 14) {
        mapInstance.current.setZoom(14);
      }
    }, 500);
  }, [siblingIntersect]);

  return <div ref={mapRef} id='map'></div>;
};

export default Map;
