import { sanitizeInput } from './../helpers/inputSanitizer';

const Artists = ({ artistId, setInputArtist, imageSrc, artist }) => {
  const inputPosition = artistId % 2 === 0 ? 'left' : 'right'

  return (
      <div className={`artistContainer`}>
        <img src={imageSrc} alt='Artist' className='artist-image'/>
        <input
          type='text'
          value={artist}
          onChange={(event) => {
            const sanitizedInput = sanitizeInput(event.target.value)
            setInputArtist(sanitizedInput);
          }}
          placeholder="Enter artist's name"
          className={`input ${inputPosition}`}
        />
      </div>
  );
};

export default Artists;
