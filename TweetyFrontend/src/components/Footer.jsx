import React from 'react'
import { Link } from 'react-router-dom'
import logo from "../assets/tweetyLogo.png"

function Footer() {
  return (
    <footer className='border-t bg-white w-full mt-22 border-gray-200'>
      <div className='flex flex-wrap justify-between items-center mt-8 px-6 gap-y-6'>

        <div className='flex flex-col md:flex-row items-center gap-y-4 gap-x-10'>
          <Link to='/'>
            <img src={logo} className='h-20' alt="Tweety Logo" />
          </Link>

          <Link to='/' className="font-bold text-sm text-black hover:text-blue-600">
            HOME
          </Link>

          <Link to='/about' className="font-bold text-sm text-black hover:text-blue-600">
            ABOUT
          </Link>
        </div>

        <div className='flex gap-x-5'>
          <a href="https://www.gmail.com/" target='_blank' rel='noopener noreferrer'>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 256 193">
              <path fill="#4285f4" d="M58.182 192.05V93.14L27.507 65.077L0 49.504v125.091c0 9.658 7.825 17.455 17.455 17.455z" />
              <path fill="#34a853" d="M197.818 192.05h40.727c9.659 0 17.455-7.826 17.455-17.455V49.505l-31.156 17.837l-27.026 25.798z" />
              <path fill="#ea4335" d="m58.182 93.14l-4.174-38.647l4.174-36.989L128 69.868l69.818-52.364l4.669 34.992l-4.669 40.644L128 145.504z" />
              <path fill="#fbbc04" d="M197.818 17.504V93.14L256 49.504V26.231c0-21.585-24.64-33.89-41.89-20.945z" />
              <path fill="#c5221f" d="m0 49.504l26.759 20.07L58.182 93.14V17.504L41.89 5.286C24.61-7.66 0 4.646 0 26.23z" />
            </svg>
          </a>

          <a href="https://www.telegram.com/" target='_blank' rel='noopener noreferrer'>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 256 256">
              <defs>
                <linearGradient id="logosTelegram0" x1="50%" x2="50%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#2aabee" />
                  <stop offset="100%" stopColor="#229ed9" />
                </linearGradient>
              </defs>
              <path fill="url(#logosTelegram0)" d="M128 0C94.06 0 61.48 13.494 37.5 37.49A128.04 128.04 0 0 0 0 128c0 33.934 13.5 66.514 37.5 90.51C61.48 242.506 94.06 256 128 256s66.52-13.494 90.5-37.49c24-23.996 37.5-56.576 37.5-90.51s-13.5-66.514-37.5-90.51C194.52 13.494 161.94 0 128 0" />
              <path fill="#fff" d="M57.94 126.648q55.98-24.384 74.64-32.152c35.56-14.786 42.94-17.354 47.76-17.441c1.06-.017 3.42.245 4.96 1.49c1.28 1.05 1.64 2.47 1.82 3.467c.16.996.38 3.266.2 5.038c-1.92 20.24-10.26 69.356-14.5 92.026c-1.78 9.592-5.32 12.808-8.74 13.122c-7.44.684-13.08-4.912-20.28-9.63c-11.26-7.386-17.62-11.982-28.56-19.188c-12.64-8.328-4.44-12.906 2.76-20.386c1.88-1.958 34.64-31.748 35.26-34.45c.08-.338.16-1.598-.6-2.262c-.74-.666-1.84-.438-2.64-.258c-1.14.256-19.12 12.152-54 35.686c-5.1 3.508-9.72 5.218-13.88 5.128c-4.56-.098-13.36-2.584-19.9-4.708c-8-2.606-14.38-3.984-13.82-8.41c.28-2.304 3.46-4.662 9.52-7.072" />
            </svg>
          </a>

          <a href="https://www.youtube.com/" target='_blank' rel='noopener noreferrer'>
            <svg xmlns="http://www.w3.org/2000/svg" width="34" height="30" viewBox="0 0 256 180">
              <path fill="#f00" d="M250.346 28.075A32.18 32.18 0 0 0 227.69 5.418C207.824 0 127.87 0 127.87 0S47.912.164 28.046 5.582A32.18 32.18 0 0 0 5.39 28.24c-6.009 35.298-8.34 89.084.165 122.97a32.18 32.18 0 0 0 22.656 22.657c19.866 5.418 99.822 5.418 99.822 5.418s79.955 0 99.82-5.418a32.18 32.18 0 0 0 22.657-22.657c6.338-35.348 8.291-89.1-.164-123.134" />
              <path fill="#fff" d="m102.421 128.06l66.328-38.418l-66.328-38.418z" />
            </svg>
          </a>
        </div>

      </div>

      <p className='text-sm text-gray-900 mt-6 text-center px-6'>For questions or concerns, write to us at <span className='underline hover:text-blue-500'>tweety465@gmail.com</span></p>

      <div className='flex justify-center mt-10'>
        <img src={logo} className='h-10' alt="Tweety Logo small" />
      </div>

      <div className='mt-6 flex flex-wrap justify-center items-center text-gray-800 w-full px-6 text-xs gap-x-4 gap-y-2 text-center'>
        {['About', 'Careers', 'Internet Safety', 'Terms of Use', 'Privacy Policy', 'DMCA Notices', 'Supplemental Terms of Use', 'Addendum to Privacy Policy - for India', 'Contest Terms and Conditions', 'Channel Distribution', 'Interest-Based Ads'].map((item, i) => (
          <Link key={i} className='hover:text-blue-500'>{item}</Link>
        ))}
      </div>

      <p className='my-6 text-xs text-gray-800 text-center px-4'>© Tweety © Tweety•Social © & ™ Lucasfilm LTD © limited. All Rights Reserved</p>
    </footer>
  )
}

export default Footer
