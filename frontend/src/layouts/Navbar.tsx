import BrandLogo from '../assets/Link - Brand Logo.png'


function Navbar() {
  return (
    <header className='flex bg-[#1F2937E5] justify-between text-[#D1D5DB] text-[14px] items-center p-5  '>
        <div>
            <img src={BrandLogo} alt="Image of Brandlogo" className='cursor-pointer' />
        </div>
        <div className='flex bg-[#FFFFFF0D] p-3.5 px-7 gap-10 rounded-full font-medium border border-solid border-[#FFFFFF1A]'>
            <p className=' cursor-pointer'>Home</p>
            <p className=' cursor-pointer'>About</p>
            <p className=' cursor-pointer'>Services</p>
        </div>
        <div className='flex gap-3 '>
            <button className='bg-[#1F2937CC] cursor-pointer text-[#E5E7EB] font-semibold px-5 py-2.5 rounded-lg border border-solid border-[#4B5563]'>Login</button>
            <button className='bg-[#0284C7] cursor-pointer text-[#FFFFFF] font-bold px-7 py-2.5 rounded-lg'>Open Account</button>
        </div>
    </header>
  )
}

export default Navbar
