import placeholder from '../assets/Placeholder2.webp';

const RightArtist = ({ prevArtist, currentArtist, animationState }) => {
  return (
    <div className='artistContainer right'>
      {/* Previous image fading out */}
      <img
        src={prevArtist || placeholder}
        className={`artist-image swipe-right ${
          prevArtist && animationState === 'exiting' ? 'exiting' : ''
        }`}
      />

      <img
        src={currentArtist || placeholder}
        className={`artist-image swipe-right ${
          currentArtist && animationState === 'entering' ? 'entering' : ''
        }`}
      />
    </div>
  );
};

export default RightArtist;
