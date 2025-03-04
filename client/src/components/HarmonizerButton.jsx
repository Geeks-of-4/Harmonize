// There is no functionality here other than the the activation of the onclick method in app.jsx.
// I will say that the css is a bit fragile on this, because it has a fixed position above the artists 

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
