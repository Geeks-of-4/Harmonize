/**
 * Nav Component
 * 
 * Navigation bar component that provides user controls for the application.
 * Includes:
 * - Application logo
 * - Title
 * - Days selector (1-7 days)
 * - Distance selector (10-100 miles)
 * 
 * Note: Contains commented-out login/signup buttons for future implementation
 * of user accounts and watchlist functionality.
 * 
 * @param {Function} setDays - Callback to update the maximum days between concerts
 * @param {Function} setMiles - Callback to update the maximum distance between venues
 */

import logo from '../assets/harmonizeLogo.png';
import './Nav.css';

const Nav = ({ setDays, setMiles }) => {
  return (
    <div className='nav'>
      {/* Application Logo */}
      <img id='logo' src={logo} />
      
      {/* Application Title */}
      <h2>HARMONIZE Your Favorite Artists In The Same City</h2>
      
      {/* Search Parameters Selection */}
      <div className='daysAndDistance'>
        {/* Days Selector - Maximum time between concerts */}
        <select id='days' onChange={(event) => setDays(event.target.value)}>
          <option value='' >
            Select Days
          </option>
          <option value='7'>7 days</option>
          <option value='6'>6 days</option>
          <option value='5'>5 days</option>
          <option value='4'>4 days</option>
          <option value='3'>3 days</option>
          <option value='2'>2 days</option>
          <option value='1'>1 day</option>
        </select>

        {/* Distance Selector - Maximum distance between venues */}
        <select id='miles' onChange={(event) => setMiles(event.target.value)}>
          <option value='' >
            Select Distance
          </option>
          <option value='100'>100 miles</option>
          <option value='50'>50 miles</option>
          <option value='25'>25 miles</option>
          <option value='10'>10 miles</option>
        </select>
      </div>

      {/* Future User Authentication Buttons */}
      {/* <div className='navButtons'>
        <button id='login'>Login</button>
        <button id='signUp'>SignUp</button>
      </div> */}
    </div>
  );
};

export default Nav;
