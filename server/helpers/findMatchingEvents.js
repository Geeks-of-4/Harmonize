// Arthur thinks it might be useful to convert this into a matrix to compare lat/longs for proximity

export function findMatchingEvents(artistEventsMap, daysMaximum, rangeMaximum) {
  console.log('🧩 Find Matching Events Invoked.');

  const artistNames = Object.keys(artistEventsMap);
  const matches = [];
  const seenEvents = new Map(); // Stores unique events with multiple artists

  function isNearby(lat1, lon1, lat2, lon2, rangeMaximum) {
    console.log('😚 Is Nearby Invoked.');
    const R = 3958.8; // Earth radius in miles

    // Convert latitude and longitude from degrees to radians
    const radLat1 = (Math.PI / 180) * lat1;
    const radLat2 = (Math.PI / 180) * lat2;
    const deltaLat = (Math.PI / 180) * (lat2 - lat1);
    const deltaLon = (Math.PI / 180) * (lon2 - lon1);

    // Haversine formula
    const a =
      Math.sin(deltaLat / 2) ** 2 +
      Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(deltaLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance <= rangeMaximum;
  }

  // Iterate through every unique pair of artists
  for (let i = 0; i < artistNames.length - 1; i++) {
    for (let j = i + 1; j < artistNames.length; j++) {
      const artist1 = artistNames[i];
      const artist2 = artistNames[j];

      const eventsArray1 = artistEventsMap[artist1];
      const eventsArray2 = artistEventsMap[artist2];

      if (!eventsArray1?.length || !eventsArray2?.length) {
        console.warn(`⚠️ Skipping ${artist1} and ${artist2}: One or both have no events.`);
        continue;
      }

      console.log(`🔗 Checking matches between ${artist1} and ${artist2}...`);

      for (const event1 of eventsArray1) {
        for (const event2 of eventsArray2) {
          const event1Date = new Date(event1.event_date);
          const event2Date = new Date(event2.event_date);
          const daysDifference = Math.abs(
            (event2Date - event1Date) / (1000 * 60 * 60 * 24)
          );

          if (daysDifference <= daysMaximum) {
            if (
              isNearby(
                parseFloat(event1.lat),
                parseFloat(event1.lng),
                parseFloat(event2.lat),
                parseFloat(event2.lng),
                rangeMaximum
              )
            ) {

              // Create a unique key for the event: Venue + Date
              const eventKey = `${event1.venue_name}_${event1.event_date}`;

              if (!seenEvents.has(eventKey)) {
                // If event doesn't exist, add it with both artists
                seenEvents.set(eventKey, {
                  event_date: event1.event_date,
                  venue_name: event1.venue_name,
                  city: event1.city,
                  lat: event1.lat,
                  lng: event1.lng,
                  ticket_url: event1.ticket_url,
                  artists: new Set([event1.artist, event2.artist]), // Store artists as a set
                });
              } else {
                // If event already exists, add the missing artist
                seenEvents.get(eventKey).artists.add(event2.artist);
              }
            }
          }
        }
      }
    }
  }

  // Convert Set of artists back to an array and format the final matches list
  for (const [eventKey, eventData] of seenEvents.entries()) {
    matches.push({
      event_date: eventData.event_date,
      venue_name: eventData.venue_name,
      city: eventData.city,
      lat: eventData.lat,
      lng: eventData.lng,
      ticket_url: eventData.ticket_url,
      artists: Array.from(eventData.artists), // Convert Set back to an array
    });
  }

  console.log(`🎯 Total unique matched events: ${matches.length}`);
  return matches;
}
