const Artists = ({ artistId, setInputArtist, imageSrc, artist, className }) => {
  return (
    <div>
      <div className={`artistContainer ${className}`}>
        <img
          src={imageSrc} //📸
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
