// In a less than elegant way, we are creating 2 of the same component to keep our code dry, 
// but passing in an explicit position in the use states through the artist ID prop.
// What this lets us do, is potentially plan to have more than to artists be visible at a time. 
// You would only need to run a map function to create the artists instead of explicitly creating them.
const Artists = ({ artistId, setInputArtist, imageSrc, artist, className }) => {
  return (
    <div>
      <div className={`artistContainer ${className}`}>
        <img
          src={imageSrc} 
          alt='Artist'
          className='artist-image'
        />
        <input
          type='text'
          value={artist}
          onChange={(event) => {
            setInputArtist((prevArtists) => {
              const updatedArtists = [...prevArtists];
              updatedArtists[artistId] = event.target.value;
              return updatedArtists;
            });
          }}
          placeholder="Enter artist's name"
          className={`input ${className}`}
        />
      </div>
    </div>
  );
};

export default Artists;
