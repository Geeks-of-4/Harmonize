import axios from 'axios';
import { response } from 'express';

const apiController = {};

apiController.getTicketMasterData = async (req, res, next) => {
  if (!Array.isArray(req.body) || req.body.length < 2) {
    return next({
      log: 'Invalid request body: Expected an array with two artist names',
      status: 400,
      message: { error: 'Invalid input. Please provide two artist names.' },
    });
  }
  const [artist1, artist2] = req.body;
  const now = new Date();
  const currentTime = now.toISOString().split('.')[0] + 'Z'; // Remove milliseconds
  now.setMonth(now.getMonth() + 12);
  const monthRange = now.toISOString().split('.')[0] + 'Z';
  const apiKey = 'K2UGwYuaehCHov5Edy6YkJiYUlmKXPRB';
  const baseUrl = 'https://app.ticketmaster.com/discovery/v2/events.json';
  const url1 = `${baseUrl}?keyword=${encodeURIComponent(
    artist1
  )}&startDateTime=${currentTime}&endDateTime=${monthRange}&apikey=${apiKey}`;
  const url2 = `${baseUrl}?keyword=${encodeURIComponent(
    artist2
  )}&startDateTime=${currentTime}&endDateTime=${monthRange}&apikey=${apiKey}`;
  try {
    const [response1, response2] = await Promise.all([
      axios.get(url1),
      axios.get(url2),
    ]);
    console.log(response1.headers);
    console.log(response2.headers);
    return res.status(200).json({
      artist1: response1.data,
      artist2: response2.data,
    });
  } catch (error) {
    console.error(
      '☠️ getTicketMasterData Controller API Error:',
      error.message
    );
    return next({
      log: `getTicketMasterData Controller API Error: ${error.message}`,
      status: 500,
      message: { error: 'Failed to fetch Ticket Master data!' },
    });
  }
};

apiController.getSpotifyImageData = async (req, res, next) => {
  if (!Array.isArray(req.body) || req.body.length < 2) {
    return next({
      log: 'Invalid request body: Expected an array with two artist names',
      status: 400,
      message: { error: 'Invalid input. Please provide two artist names.' },
    });
  }
  try {
  } catch (error) {
    console.error(
      '☠️ getSpotifyImageData Controller API Error:',
      error.message
    );
    return next({
      log: `getSpotifyImageData Controller API Error: ${error.message}`,
      status: 500,
      message: { error: 'Failed to fetch Spotify Image data!' },
    });
  }
};

export default apiController;
