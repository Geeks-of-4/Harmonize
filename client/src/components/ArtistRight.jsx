/**
 * RightArtist Component
 * 
 * Displays the artist image on the right side of the screen with animation effects.
 * Handles the transition between previous and current artist images.
 * 
 * @param {string} prevArtist - URL of the previous artist's image
 * @param {string} currentArtist - URL of the current artist's image
 * @param {string} animationState - Current state of the animation ('entering', 'exiting', or 'paused')
 */

import placeholder from '../assets/Placeholder2.webp';

const RightArtist = ({ prevArtist, currentArtist, animationState }) => {
  return (
    <div className='artistContainer right'>
      {/* Previous image that fades out during transition */}
      <img
        src={prevArtist || placeholder}
        className={`artist-image swipe-right ${
          prevArtist && animationState === 'exiting' ? 'exiting' : ''
        }`}
      />

      {/* Current image that fades in during transition */}
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
