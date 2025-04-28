/**
 * HarmonizerButton Component
 * 
 * A styled button component that triggers the main harmonization process.
 * The button uses a custom image asset and is positioned above the artist display.
 * 
 * Note: The CSS positioning is currently fixed, which may need to be made more flexible
 * in future updates to improve responsiveness.
 * 
 * @param {Function} onClick - Callback function to handle button click events
 */

import harmonizeButton from '../assets/Harmonize.png';

const HarmonizerButton = ({ onClick }) => {
  return (
    <div className='harmonizer-container'>
      <button className={`harmonizer-button`} onClick={onClick}>
        <img src={harmonizeButton} alt='Harmonize Button' />
      </button>
    </div>
  );
};

export default HarmonizerButton;
