import logo from '../assets/harmonizeLogo.png';
import './Nav.css';

const Nav = ({ setDays, setMiles }) => {
  return (
    <div className='nav'>
      <img id='logo' src={logo} />
      <h2>HARMONIZE Your Favorite Artists In The Same City</h2>
      <div className='daysAndDistance'>
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
      {/* <div className='navButtons'>
        <button id='login'>Login</button>
        <button id='signUp'>SignUp</button>
      </div> */}
    </div>
  );
};

export default Nav;
