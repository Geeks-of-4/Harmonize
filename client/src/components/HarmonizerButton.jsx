import harmonizeButton from '../assets/Harmonize.png';

const HarmonizerButton = ({ onClick, isToggled }) => {
  return (
    <div className='harmonizer-container'>
      <button
        className={`harmonizer-button ${isToggled ? 'active' : ''}`}
        onClick={onClick}
      >
        <img src={harmonizeButton} alt='Harmonize Button' />
      </button>
    </div>
  );
};

export default HarmonizerButton;
