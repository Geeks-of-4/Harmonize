import placeholder from '../assets/Placeholder1.webp';

const LeftArtist = ({ prevArtist, currentArtist, animationState }) => {
  return (
    <div className='artistContainer left'>
      {/* Previous image fading out */}
      <img
        src={prevArtist || placeholder}
        className={`artist-image swipe-left ${
          prevArtist && animationState === 'exiting' ? 'exiting' : ''
        }`}
      />

      <img
        src={currentArtist || placeholder}
        className={`artist-image swipe-left ${
          currentArtist && animationState === 'entering' ? 'entering' : ''
        }`}
      />
    </div>
  );
};

export default LeftArtist;
