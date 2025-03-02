import { useState } from "react";

const HarmonizerButton = ({ onClick, isToggled, text = 'Harmonize' }) => {


  return (
    <button
      className={`harmonizer-button ${isToggled ? "active" : ""}`}
      onClick={onClick}
    >
      <div className="bar1"></div>
      <div className="bar2"></div>
      <span className='harmonizer-text'>{text} </span>
    </button>
  );
};

export default HarmonizerButton;
