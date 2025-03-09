import axios from 'axios';

export const fetchTicketmasterData = async (artists) => {
  if (!Array.isArray(artists)) {
    throw new Error("❌ fetchTicketmasterData expects an array of artist names.");
  }

  const tmApiKey = process.env.TM_API_KEY;
  const baseUrl = "https://app.ticketmaster.com/discovery/v2/events.json";

  const now = new Date();
  const currentTime = now.toISOString().split(".")[0] + "Z";
  now.setMonth(now.getMonth() + 12);
  const monthRange = now.toISOString().split(".")[0] + "Z";

  const fetchPromises = artists.map(async (artist) => {
    const url = `${baseUrl}?keyword=${encodeURIComponent(
      artist
    )}&startDateTime=${currentTime}&endDateTime=${monthRange}&apikey=${tmApiKey}`;

    try {
      console.log(`🎟️ Fetching Ticketmaster API for: ${artist}`);
      console.log(`🔗 API Request URL: ${url}`);

      const response = await axios.get(url);
      
      // Warning, this console log is massive
      // console.log(`✅ Ticketmaster Response for ${artist}:`, JSON.stringify(response.data, null, 2));
      
      return { artist, data: response.data };
    } catch (error) {
      console.error(`❌ Ticketmaster API Error for ${artist}:`, error.message);
      return { artist, error: error.message };
    }
  });

  return Promise.allSettled(fetchPromises);
};