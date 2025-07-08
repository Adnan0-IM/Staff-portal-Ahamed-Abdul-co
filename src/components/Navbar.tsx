import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import logo from '../assets/logo2.jpg'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const closeMenu = () => setMobileOpen(false);

  return (
    <nav className="flex w-full text-[#052659] text-center bg-white items-center justify-between fixed top-0 z-50 shadow-md">
      <img src={logo} alt="Ahmed-Abdul&co" className="w-[70px] h-auto p-4 sm:ml-[40px]" />
      <ul className="hidden sm:flex list-none ">
        <li className="mx-5"><Link className={`font-bold sm:font-semibold sm:text-lg text-xl ${isActive('/') ? 'text-[#052659] ' : 'text-[#3982f0]'}`} to="/">Home</Link></li>
        <li className="mx-5"><Link className={`font-bold sm:font-semibold sm:text-lg text-xl ${isActive('/about-us') ? 'text-[#052659] ' : 'text-[#3982f0]'}`} to="/about-us">About Us</Link></li>
        <li className="mx-5"><Link className={`font-bold sm:font-semibold sm:text-lg text-xl ${isActive('/services') ? 'text-[#052659] ' : 'text-[#3982f0]'}`} to="/services">Services</Link></li>
        <li className="mx-5"><Link className={`font-bold sm:font-semibold sm:text-lg text-xl ${isActive('/contact') ? 'text-[#052659] ' : 'text-[#3982f0]'}`} to="/contact">Contact Us</Link></li>
      </ul>
      <span
        className="text-black text-3xl p-4 cursor-pointer sm:hidden hover:bg-gray-50"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >{mobileOpen ? '✕' : '\u2630'}</span>
      {/* Mobile menu */}
      <ul className={`list-none flex-col gap-8 absolute top-16 left-0 bg-gray-100 backdrop-blur-3xl w-full h-screen text-4xl transition-all duration-300 ${mobileOpen ? '' : 'hidden'}`}>
        <li className="mx-5 my-8"><Link className={`font-bold text-4xl ${isActive('/') ? 'text-[#052659] ' : 'text-[#3982f0]'}`} to="/" onClick={closeMenu}>Home</Link></li>
        <li className="mx-5 mb-8"><Link className={`font-bold text-4xl ${isActive('/about-us') ? 'text-[#052659] ' : 'text-[#3982f0]'}`} to="/about-us" onClick={closeMenu}>About Us</Link></li>
        <li className="mx-5 mb-8"><Link className={`font-bold text-4xl ${isActive('/services') ? 'text-[#052659] ' : 'text-[#3982f0]'}`} to="/services" onClick={closeMenu}>Services</Link></li>
        <li className="mx-5 mb-8"><Link className={`font-bold text-4xl ${isActive('/contact') ? 'text-[#052659] ' : 'text-[#3982f0]'}`} to="/contact" onClick={closeMenu}>Contact Us</Link></li>
        <li className="mx-5 mb-8 flex justify-center"><Link className="text-white bg-[#22489e] border-0 rounded-lg px-8 py-4 text-4xl font-bold w-full text-center" to="/staffportal" onClick={closeMenu}>Staff portal</Link></li>
      </ul>
      <div className="hidden sm:flex">
        <Link to="/staffportal"><button className="text-white bg-[#22489e] border-0 rounded-lg mr-10 p-[10px]">Staff portal</button></Link>
      </div>
    </nav>
  );
}