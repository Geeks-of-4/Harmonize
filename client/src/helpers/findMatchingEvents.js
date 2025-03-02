export function findMatchingEvents(
  eventsArray1,
  eventsArray2,
  daysMaximum,
  rangeMaximum
) {
  // console.log('🧩 Find Matching Events Invoked.');
  // create an empty storage array for results
  const matches = [];

  function isNearby(lat1, lon1, lat2, lon2, rangeMaximum) {
    // console.log('😚 Is Nearby Invoked.');
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
    // console.log('🚗 Distance: ', distance);
    // console.log('📏 Max Range: ', rangeMaximum);
    // return true or false if it is close or not
    return distance <= rangeMaximum;
  }
  // Milti had a good idea to check the smallest feasible date range
  // For example if artiest 1 starts touring in june, while artist 2 started today, there is no need to compare events between now and june.
  // Same thing for the tail end, one stops before the other, which limits how much you need to compare in this nested for loop.
  for (const artist1Event of eventsArray1) {
    // This is a group that will contain all matching events within the date/dist range
    let matchingGroup = [artist1Event];

    for (const artist2Event of eventsArray2) {
      // convert dates to compare them
      const artist1Date = new Date(artist1Event.event_date);
      const artist2Date = new Date(artist2Event.event_date);
      const timeDifference = Math.abs(artist2Date - artist1Date);
      // convert the time difference back into days
      const daysDifference = timeDifference / (1000 * 60 * 60 * 24);
      if (daysDifference <= daysMaximum) {
        if (
          isNearby(
            parseFloat(artist1Event.lat),
            parseFloat(artist1Event.lng),
            parseFloat(artist2Event.lat),
            parseFloat(artist2Event.lng),
            rangeMaximum
          )
        ) {
          // console.log('✅ Match Found! ', artist1Event, artist2Event);
          matchingGroup.push(artist2Event);
          // } else {console.log('❌ Rejected Match (Distance): ', artist1Event, artist2Event);
        }
      }
      // else {console.log('❌ Rejected Match (Date): ', artist1Event, artist2Event);}
      // for each time a group is created, push the whole group to the results
      if (matchingGroup.length > 1) {
        matches.push(matchingGroup);
      }
    }
  }
  return matches;
}
