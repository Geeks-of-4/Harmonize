import React, { useEffect, useRef } from 'react';

const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const googleMapsMapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;

// console.log("Google Maps API Key:", googleMapsApiKey);
// console.log("Google Maps Map ID:", googleMapsMapId);

window.onGoogleMapsLoaded = () => {
  console.log("✅ Google Maps API fully loaded!");
};

const loadGoogleMapsScript = (callback) => {
  if (window.google && window.google.maps && window.google.maps.marker) {
    console.log('✅ Google Maps already loaded');
    callback();
    return;
  }

  const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
  if (existingScript) {
    console.warn("⚠️ Google Maps script already exists, not loading again.");
    return;
  }

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=maps,marker&v=beta&callback=onGoogleMapsLoaded`;
  script.async = true;
  script.defer = true;
  script.onload = () => {
    const waitForAdvancedMarker = setInterval(() => {
      if (
        window.google &&
        window.google.maps &&
        window.google.maps.marker?.AdvancedMarkerElement
      ) {
        clearInterval(waitForAdvancedMarker);
        console.log('✅ AdvancedMarkerElement is now available!');
        callback();
      }
    }, 100); // Check every 100ms

    setTimeout(() => {
      clearInterval(waitForAdvancedMarker);
      console.error(
        '❌ Timeout: AdvancedMarkerElement did not become available.'
      );
    }, 5000); // Timeout after 5 seconds
  };

  script.onerror = () => console.error('❌ Failed to load Google Maps API.');
  document.head.appendChild(script);
};

const Map = ({ tours, siblingIntersect }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    loadGoogleMapsScript(() => {
      const waitForAdvancedMarker = setInterval(() => {
        if (
          window.google &&
          window.google.maps &&
          window.google.maps.marker?.AdvancedMarkerElement
        ) {
          clearInterval(waitForAdvancedMarker);
          console.log('✅ Now running map setup...');

          const { Map, InfoWindow, LatLngBounds } = window.google.maps;
          const AdvancedMarkerElement =
            window.google.maps.marker.AdvancedMarkerElement;

          if (!mapRef.current) return;

          mapInstance.current = new Map(mapRef.current, {
            center: { lat: 39.661, lng: -95.699 },
            zoom: 4,
            mapId: googleMapsMapId,
          });

          if (tours.length === 0) return;

          const bounds = new LatLngBounds();
          const infoWindow = new InfoWindow();
          const markers = [];

          tours
            .flat()
            .forEach(
              ({
                artist,
                event_date,
                venue_name,
                city,
                lat,
                lng,
                ticket_url,
              }) => {
                const position = { lat: parseFloat(lat), lng: parseFloat(lng) };
                let marker;

                if (AdvancedMarkerElement) {
                  marker = new AdvancedMarkerElement({
                    position,
                    map: mapInstance.current,
                  });
                } else {
                  marker = new window.google.maps.Marker({
                    position,
                    map: mapInstance.current,
                  });
                }

                const contentString = `
                  <div style="font-family: 'Anton', sans-serif; background-color: #19002e; color: #ccc; border-radius: 8px; max-width: 250px; text-align: center;">
                  <span style="letter-spacing: 1px; font-size: 1.4rem;">${artist}</span><br>
                  <span style="font-size: 1rem;">${event_date}</span><br>
                  <span style="font-size: 0.9rem;">${venue_name}</span><br>
                  <span style="font-size: 0.9rem;">${city || ''}</span><br>
                  <a href="${ticket_url}" target="_blank" style="display:inline-block; margin-top: 8px; background: #4a0072; color: white; padding: 8px 12px; text-decoration: none; border-radius: 5px; transition: background 0.3s;">
                  Buy Tickets</a></div>`;

                const clickListener = () => {
                  infoWindow.setContent(contentString);
                  infoWindow.open(mapInstance.current, marker);
                };

                marker.addListener('click', clickListener);
                markers.push({ marker, listener: clickListener });

                bounds.extend(position);
              }
            );

          if (!bounds.isEmpty()) {
            mapInstance.current.fitBounds(bounds);
          }

          // Cleanup function to remove markers when `useEffect` re-runs
          return () => {
            markers.forEach(({ marker, listener }) => {
              window.google.maps.event.removeListener(listener);
              marker.setMap(null);
            });
          };
        }
      }, 100); // Check every 100ms

      setTimeout(() => {
        clearInterval(waitForAdvancedMarker);
        console.error(
          '❌ Timeout: AdvancedMarkerElement did not become available in useEffect.'
        );
      }, 5000); // Timeout after 5 seconds
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
