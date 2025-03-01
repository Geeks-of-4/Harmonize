
const Nav = ( setDays, setMiles ) => {

    return (

     <div className='nav'>
      <img id='logo' src='../assets/harmonizeLogo.png'/>
      <h2>Harmonize Turn Every City into a Festival</h2>
      <select id='days' onChange={(event) => setDays(event.target.value)}>
        <option value='2'>2</option>
        <option value='3'>3</option>
        <option value='4'>4</option>
        <option value='5'>5</option>
        <option value='6'>6</option>
        <option value='7'>7</option>
      </select>
      <select id='days' onChange={(event) => setMiles(event.target.value)}>
        <option value='10'>1</option>
        <option value='25'>2</option>
        <option value='50'>3</option>
        <option value='100'>4</option>
      </select>
      <a href='http://google.com'>About</a>
      <button>Login</button>
      <button>SignUp</button>
     </div>
    )
  }
  
  export default Nav