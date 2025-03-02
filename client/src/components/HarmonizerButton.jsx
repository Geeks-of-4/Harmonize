import { useRef } from 'react';
import harmonizeButton from '../assets/Harmonize.png'

const HarmonizerButton = ({ onClick, isToggled }) => {
  // I am storing the creating interval here
  const intervalReference = useRef(null);

  // alright so I am trying to make music notes appear from this button on hover
  function getRandomMusicCharacter() {
    const musicSymbols = [
      '𝄞',
      '𝄢',
      '𝅘',
      '𝅘𝅥',
      '𝅘𝅥𝅰',
      '𝅘𝅥𝅯',
      '𝅘𝅥𝅮',
      '♩',
      '♪',
      '♫',
      '♬',
    ];
    return musicSymbols[Math.floor(Math.random() * musicSymbols.length)];
  }

  function createMusicNotes() {
    // find where the fizzy notes go and end the function prematurely is there is no container
    const fizzyContainer = document.getElementById('notes-container');
    if (!fizzyContainer) return;

    // create a new note span, assign it a music note and then assign it a class name
    const note = document.createElement('span');
    note.textContent = getRandomMusicCharacter();
    note.classList.add('fizzy');

    // get the bounding rectangle for the button
    const button = document.querySelector('.harmonizer-button');
    const buttonRect = button.getBoundingClientRect();

    // get a random angle (because)
    const angle = Math.random() * Math.PI * 2; // Converts to radians

    // Generate a random radius (distance from the button)
    const radius = Math.random() * 60 + 30; // Spread between 30px and 90px

    // Calculate X and Y offsets based on polar coordinates
    const offsetX = Math.cos(angle) * radius;
    const offsetY = Math.sin(angle) * radius;

    // Position the notes around the button
    note.style.left = `${buttonRect.left + buttonRect.width / 2 + offsetX}px`;
    note.style.top = `${buttonRect.top + buttonRect.height / 2 + offsetY}px`;

    // randomize the color & rotation
    note.style.setProperty('--hue', Math.random());
    const rotation = (Math.random() - 0.5) * 90;
    note.style.transform = `rotate(${rotation}deg)`;

    // append the note to the container
    fizzyContainer.appendChild(note);

    // remove notes after 1 second
    setTimeout(() => {
      note.remove();
    }, 1500);
    console.log('Note Created: ', note);
  }
  // this function fires on mouse enter, which triggers the recursive loop
  function startGeneratingNotes() {
    // so if the interval reference is empty
    if (!intervalReference.current) {
      // set the value to make notes every 150 ms
      intervalReference.current = setInterval(createMusicNotes, 35);
    }
  }
  // this function fires on mouse leave, which ends the recursive loop
  function stopGeneratingNotes() {
    clearInterval(intervalReference.current);
    intervalReference.current = null;
  }

  return (
    <div className='harmonizer-container'>
      <button
        className={`harmonizer-button ${isToggled ? 'active' : ''}`}
        onClick={onClick}
        onMouseEnter={startGeneratingNotes}
        onMouseLeave={stopGeneratingNotes}
      >
        <img src={harmonizeButton} alt='Harmonize Button' className='harmonizer-button'/>
      </button>
      <div id='notes-container'></div>
    </div>
  );
};

export default HarmonizerButton;
