export function findMatchingEvents(
  eventsArray1,
  eventsArray2,
  daysMaximum,
  rangeMaximum
) {
  // create an empty storage array for results
  const matches = [];

  function isNearby(lat1, lon1, lat2, lon2, rangeMaximum) {
    const R = 3958.8;

    // Convert latitude and longitude from degrees to radians
    const radLat1 = (Math.PI / 180) * lat1;
    const radLat2 = (Math.PI / 180) * lat2;
    const deltaLat = (Math.PI / 180) * (lat2 - lat1);
    const deltaLon = (Math.PI / 180) * (lon2 - lon1);

    // Haversine formula
    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(radLat1) *
        Math.cos(radLat2) *
        Math.sin(deltaLon / 2) *
        Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in miles

    // return true or false if it is close or not
    return distance <= rangeMaximum;
  }

  for (const artist1Event of eventsArray1) {
    for (const artist2Event of eventsArray2) {
      // convert dates to compare them
      const artist1Date = new Date(artist1Event.event_date);
      const artist2Date = new Date(artist2Event.event_date);
      const timeDifference = Math.abs(artist2Date - artist1Date);
      //convert the time difference back into days
      const daysDifference = timeDifference / (1000 * 60 * 60 * 24);

      if (daysDifference <= daysMaximum) {
        if (
          isNearby(
            parseFloat(artist1Event.latitude),
            parseFloat(artist1Event.longitude),
            parseFloat(artist2Event.latitude),
            parseFloat(artist2Event.longitude),
            rangeMaximum
          )
        ) {
          matches.push([artist1Event, artist2Event]);
        }
      }
    }
  }
  return matches;
}
