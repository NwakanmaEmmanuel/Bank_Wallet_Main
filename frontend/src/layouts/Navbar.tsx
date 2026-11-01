import BrandLogo from '../assets/Link - Brand Logo.png'


function Navbar() {
  return (
    <header className='flex  '>
        <div>
            <img src={BrandLogo} alt="Image of Brandlogo" />
        </div>
        <div>
            <p>Home</p>
            <p>About</p>
            <p>Services</p>
        </div>
        <div>
            <button>Login</button>
            <button>OpenAccount</button>
        </div>
    </header>
  )
}

export default Navbar
