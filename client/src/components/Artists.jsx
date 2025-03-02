//import { useEffect } from 'react';

const Artists = ({
  setInputArtist = '',
  setInputArtist2,
  setImageSrc = '/artistImage.jpg',
}) => {
  // Example artists data (awaiting fetched artist and image data from API)
  const artistsList = [
    { name: 'Artist1', image: '/path/to/artist1.jpg' },
    { name: 'Artist2', image: '/path/to/artist2.jpg' },
  ];

  const handleArtistChange = (event) => {
    const newArtist = event.target.value;
    setInputArtist(newArtist);
    artistFromList(newArtist);
    setImageSrc(newArtist);
  };

  // const artistFromList = (artist, artistImage) => {
    // Find the artist object based on the entered name
    // const artistFound = artistsList.find(
    //   (artist) => artist.name.toLowerCase() === value.toLowerCase()
    // );

    // if (artistFound) {
    //   // If the artist exists, set the image source
    //   setImageSrc(artistFound.image);
    // } else {
    //   // If artist not found, keep the default image
    //  // TODO: Add feature to rotate through random artists every 5 seconds before user input

    //   setImageSrc('/public/artistImage.jpg');
    // }
  // };

  // Optional: if you want to set the default image on page load (which is already done with `useState`)
  // useEffect(() => {
  //   You can perform actions here if necessary when the page first loads,
  //   such as logging or fetching data, but the default image is already set
  // }, []); Empty dependency array ensures this runs only once on page load

  return (
    <>
      <div className='artistContainer'>
        <img
          src={artistImage[0]} //📸
          alt='Artist'
          className='artist-image'
        />
        <input
          type='text'
          value={artist}
          onChange={(event) => setInputArtist[0](event.target.value)}
          //onClick={handleInputClick} // Adding the onClick event to input
          placeholder="Enter artist's name"
          className='input'
        />
      </div>
    </>
  );
};

export default Artists;
