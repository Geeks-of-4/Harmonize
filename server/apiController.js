const apiController = {};

apiController.getTicketMasterData = async (req, res, next) => {
  
  const apiKey = 'K2UGwYuaehCHov5Edy6YkJiYUlmKXPRB';
  const artist1 = req.body.data.artist[0]
  const artist2 = req.body.data.artist[1]
  const timestamp = Date.now();
  const date = new Date(timestamp);
  const currentTime = date.toISOString();
  date.setMonth(date.getMonth() + 6);
  const sixMonthsLater = date.toISOString();
  const url1 = `https://cors-anywhere.herokuapp.com/https://app.ticketmaster.com/discovery/v2/events.json?keyword=${artist1}&startDateTime=${currentTime}&endDateTime=${sixMonthsLater}&apikey=${apiKey}`;
  const url2 = `https://cors-anywhere.herokuapp.com/https://app.ticketmaster.com/discovery/v2/events.json?keyword=${artist2}&startDateTime=${currentTime}&endDateTime=${sixMonthsLater}&apikey=${apiKey}`;
  try {
    const [response1, response2] = await Promise.all([
      axios.get(url1),
      axios.get(url2),
    ]);
    res.locals.response1 = response1;
    res.locals.response2 = response2;
  } catch (error) {
    console.error('☠️ GitHub API Error:', error.message);
    return next({
      log: `GitHub API Error: ${error.message}`,
      status: 500,
      message: { error: 'Failed to fetch GitHub trending repositories' },
    });
  }
};
