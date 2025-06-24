# 🎶 Harmonize

**Harmonize** is a web application that helps users find concerts where their two favorite artists are performing in the same city within a specified date range and distance. The application pulls data from multiple APIs, including Spotify, Ticketmaster, and Google Maps, to visualize potential concert matches.

---

## 📂 Project Structure


### **Initial Setup**

- First setup a .env file to store APIs, will need to setup a .env in both the client and server folders.
-  Will also need to create accounts for MongoDB, Google Cloud Console, Spotify for Developers, and Ticketmaster Developer.
- Client `.env`:
  - **[`Map.jsx`](./client/src/components/Map.jsx)**: Need to setup Maps JavaScript API <a href="https://console.cloud.google.com/">Google Cloud Console</a>
  - Example: <br>
     ```
     VITE_GOOGLE_MAPS_API_KEY =(insert Google Map API)
     VITE_GOOGLE_MAPS_MAP_ID = (insert Google Map ID)
     VITE_BACKEND_URL =(insert server address)
     ```

- Server `.env`:
  - **[`server/apiController.js`](./server/apiController.js)**: Need to setup TicketMaster API at <a href="https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/">Ticketmaster Developer</a>
  - **[`server/helperFunctions.js`](./server/helperFunctions.js)**: Need to setup Spotify API at <a href="https://developer.spotify.com/documentation/web-api">Spotify for Developers</a>
  - **[`db.js`](./server/db.js)**: Need to setup MongoDB at <a href="https://www.mongodb.com/">MongoDB</a>
   - Example: <br>
      ```
      MONGO_URI_DEV = (insert MONGO URI)
      TM_API_KEY = (insert TicketMaster API Key)
      SPOTIFY_CLIENT_ID = (insert Spotify API Key)
      SPOTIFY_CLIENT_SECRET = (inset Spotify Client Secret)
      ```






### **Main Components**
- **[`main.jsx`](./client/index.html)**: Entry point of the React application. It renders the `App` component inside `StrictMode` to enforce best practices.
- **[`App.jsx`](./client/src/App.jsx)**: The core of the application, managing state and business logic. It handles:
  - Fetching artist images from Spotify.
  - Retrieving concert data from Ticketmaster.
  - Extracting relevant information via helper functions.
  - Finding intersecting tour dates and locations.
  - Rendering results and updating the UI dynamically.

### **Components**
- **[`Nav.jsx`](./client/src/components/Nav.jsx)**: A navigation bar that allows users to set parameters for search, such as max range (miles) and max days apart.
- **[`Artists.jsx`](./client/src/components/Artists.jsx)**: Handles user input for artist names and displays their corresponding images.
- **[`HarmonizerButton.jsx`](./client/src/components/HarmonizerButton.jsx)**: The main action button that triggers all API requests and starts the matching process.
- **[`Map.jsx`](./client/src/components/Map.jsx)**: Uses Google Maps API to display concerts and zoom into a specific event when selected.

### **Helper Functions**
- **[`extractDatesFromApiResponse.js`](./client/src/helpers/extractDatesFromApiResponse)**: Processes Ticketmaster API responses, extracts relevant event data, and ensures geolocation accuracy (including Google Geocoding if necessary).
- **[`findMatchingEvents.js`](./client/src/helpers/findMatchingEvents)**: Determines intersecting concert locations and dates using date and distance filtering, applying the Haversine formula for proximity calculations.

### **Styling**
- **[`Nav.css`](./client/src/components/Nav.css)**: Styles specifically for the navigation bar.
- **[`App.css`](./client/src/App.css)**: The main global stylesheet containing layout, animations, and map styling.
- **[`index.css`](./client/src/index.css)**: A general reset stylesheet to ensure consistency across browsers.

---

## 🚀 How It Works
1. **Enter two artist names** in the input fields.
2. **Click the "Harmonize" button**, triggering:
   - API calls to Spotify for artist images.
   - API calls to Ticketmaster for concert data.
   - A filtering process to find overlapping events within the user-defined constraints.
3. **View matching events** in a list and interact with the Google Map to explore concert locations.
4. **Click an event** to zoom into the corresponding location on the map and get a link to purchase tickets.

---

## ⚙️ Features & Considerations
- **No Persistent Storage**: Data is fetched dynamically on demand—every click generates fresh results.
- **Potential API Overload**: A single search may trigger multiple API calls (2 to Spotify, 2 to Ticketmaster, 30+ to Google Maps).
- **Known Issues**:
  - Artist image mismatches between Spotify and Ticketmaster due to unsanitized inputs.
  - Duplicate results appearing in certain cases.
  - The map occasionally re-renders multiple times when clicking an event.

---

## 🛠️ Future Improvements
- Implement caching to reduce redundant matching checks.
- Introduce a user login system to save favorite artist pairs
- Create a system to send notifications to users when new matches appear.
- Refactor distance calculations into a separate helper function for better readability.
- Optimize Google Maps rendering to prevent unnecessary re-renders.
- Assign Key values to all components to minimize React re-renders. 

---

## 📝 Credits
This project was built using **React**, **Google Maps API**, **Spotify API**, **Ticketmaster API**, and **Axios**.
Shout out to the Geeks of 4; Scrumlord Wing, Mergemaster Chris, Fearless Brandon, and Tico

---

🎤 *See your two favorite artists in one city...*  
Happy harmonizing! 🎵
