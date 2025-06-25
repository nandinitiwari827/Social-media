import React, { useRef, useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import logo from "../assets/tweetyLogo.png"
import { logoutUser, searchUsers } from '../api.js'

function Header() {
  const navigate = useNavigate()
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')))
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [showDropDown, setShowDropDown] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const modalRef = useRef(null)

  const handleSignUp = () => {
    navigate("/account")
  }

  const handleLogout = async () => {
    try {
      await logoutUser()
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
      navigate('/login')
    } catch (error) {
      console.error('Logout failed: ', error.message)
      alert('Failed to logout')
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim() !== "") {
        try {
          const res = await searchUsers(searchQuery)
          setSearchResults(res.data)
          setShowDropDown(true)
        } catch (error) {
          setSearchResults([])
          setShowDropDown(true)
        }
      } else {
        setSearchResults([])
        setShowDropDown(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowDropDown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu)
  }

  return (
    <div className='shadow-md sticky top-0 z-50 bg-white py-2 px-4 md:px-6'>
      <div className='max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4'>
        <div className='flex items-center gap-x-6 md:gap-x-10'>
          <Link to='/'>
            <img src={logo} className='h-10 md:h-12 object-contain rounded-xl' alt="Tweety Logo" />
          </Link>
          <nav className='hidden md:flex items-center gap-x-6'>
            <NavLink 
              to='/' 
              className={({isActive})=>`hover:text-blue-500 font-bold duration-200 text-sm ${isActive ? "text-blue-500" : "text-gray-500"}`}
            >
              HOME
            </NavLink>
            <NavLink 
              to='/about' 
              className={({isActive})=>`hover:text-blue-500 duration-200 font-bold text-sm ${isActive ? "text-blue-500" : "text-gray-500"}`}
            >
              ABOUT
            </NavLink>
          </nav>
        </div>

        <div className='flex items-center gap-x-36 sm:gap-x-4'>
          <div className='hidden md:block'>
            {user ? (
              <div className='relative group'>
                <div className='cursor-pointer gap-x-1 rounded-lg flex text-gray-500 font-bold text-sm duration-200 hover:text-white hover:bg-blue-500 items-center px-2 h-[40px] mt-1'>
                  <Link className='fill-[#696969] hover:fill-white'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
                      <g fill="none">
                        <path stroke="currentColor" strokeWidth="1.5" d="M21 12a8.96 8.96 0 0 1-1.526 5.016A8.99 8.99 0 0 1 12 21a8.99 8.99 0 0 1-7.474-3.984A9 9 0 1 1 21 12Z"/>
                        <path fill="currentColor" d="M13.25 9c0 .69-.56 1.25-1.25 1.25v1.5A2.75 2.75 0 0 0 14.75 9zM12 10.25c-.69 0-1.25-.56-1.25-1.25h-1.5A2.75 2.75 0 0 0 12 11.75zM10.75 9c0-.69.56-1.25 1.25-1.25v-1.5A2.75 2.75 0 0 0 9.25 9zM12 7.75c.69 0 1.25.56 1.25 1.25h1.5A2.75 2.75 0 0 0 12 6.25zM5.166 17.856l-.719-.214l-.117.392l.267.31zm13.668 0l.57.489l.266-.310l-.117-.393zM9 15.75h6v-1.5H9zm0-1.5a4.75 4.75 0 0 0-4.553 3.392l1.438.428A3.25 3.25 0 0 1 9 15.75zm3 6a8.23 8.23 0 0 1-6.265-2.882l-1.138.977A9.73 9.73 0 0 0 12 21.75zm3-4.5c1.47 0 2.715.978 3.115 2.32l1.438-.428A4.75 4.75 0 0 0 15 14.25zm3.265 1.618A8.23 8.23 0 0 1 12 20.25v1.5a9.73 9.73 0 0 0 7.403-3.405z"/>
                      </g>
                    </svg>
                  </Link>
                  Hi, {user.firstName}
                  <Link className='fill-[#696969] hover:fill-white relative'>
                    <svg className='transition-transform duration-300 group-hover:rotate-[180deg]' xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
                      <path fill="currentColor" d="m12 10.828l-4.95 4.95l-1.414-1.414L12 8l6.364 6.364l-1.414 1.414z"/>
                    </svg>
                  </Link>
                </div>
                <div className='absolute z-50 hidden group-hover:block transition-all w-[200px]'>
                  <svg className="fill-blue-500 relative left-17 z-50" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                    <path d="M11.178 19.569a.998.998 0 0 0 1.644 0l9-13A.999.999 0 0 0 21 5H3a1.002 1.002 0 0 0-.822 1.569z"/>
                  </svg>
                  <div className='z-50 bg-white border border-gray-500 flex flex-col rounded-xl p-1.5'>
                    <Link to="/changeDetails" className='text-sm w-full text-left p-3 text-gray-500 hover:text-blue-500'>Change Account Details</Link>
                    <Link to="/changePassword" className='border-t border-gray-500 text-sm w-full text-left p-3 text-gray-500 hover:text-blue-500'>Change Password</Link>
                    <Link to="/account" className='border-t border-gray-500 text-sm w-full text-left p-3 text-gray-500 hover:text-blue-500'>Register</Link>
                    <Link onClick={handleLogout} className='border-t border-gray-500 text-sm w-full text-left p-3 text-gray-500 hover:text-blue-500'>Logout</Link>
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={handleSignUp} className='cursor-pointer gap-x-1 rounded-lg flex text-gray-500 font-bold text-sm duration-200 hover:text-white hover:bg-blue-500 items-center px-2 h-[40px] mt-1'>
                <Link className='fill-[#696969] hover:fill-white'>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
                    <g fill="none">
                      <path stroke="currentColor" strokeWidth="1.5" d="M21 12a8.96 8.96 0 0 1-1.526 5.016A8.99 8.99 0 0 1 12 21a8.99 8.99 0 0 1-7.474-3.984A9 9 0 1 1 21 12Z"/>
                      <path fill="currentColor" d="M13.25 9c0 .69-.56 1.25-1.25 1.25v1.5A2.75 2.75 0 0 0 14.75 9zM12 10.25c-.69 0-1.25-.56-1.25-1.25h-1.5A2.75 2.75 0 0 0 12 11.75zM10.75 9c0-.69.56-1.25 1.25-1.25v-1.5A2.75 2.75 0 0 0 9.25 9zM12 7.75c.69 0 1.25.56 1.25 1.25h1.5A2.75 2.75 0 0 0 12 6.25zM5.166 17.856l-.719-.214l-.117.392l.267.31zm13.668 0l.57.489l.266-.310l-.117-.393zM9 15.75h6v-1.5H9zm0-1.5a4.75 4.75 0 0 0-4.553 3.392l1.438.428A3.25 3.25 0 0 1 9 15.75zm3 6a8.23 8.23 0 0 1-6.265-2.882l-1.138.977A9.73 9.73 0 0 0 12 21.75zm3-4.5c1.47 0 2.715.978 3.115 2.32l1.438-.428A4.75 4.75 0 0 0 15 14.25zm3.265 1.618A8.23 8.23 0 0 1 12 20.25v1.5a9.73 9.73 0 0 0 7.403-3.405z"/>
                    </g>
                  </svg>
                </Link>
                SIGN UP
                <Link className='fill-[#696969] hover:fill-white relative'>
                  <svg className='transition-transform duration-300 group-hover:rotate-[180deg]' xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
                    <path fill="currentColor" d="m12 10.828l-4.95 4.95l-1.414-1.414L12 8l6.364 6.364l-1.414 1.414z"/>
                  </svg>
                </Link>
              </button>
            )}
          </div>

          <div ref={modalRef} className='relative'>
            <svg 
              className='absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer fill-gray-400 hover:fill-blue-500'
              xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
            >
              <path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5"/>
            </svg>
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search users...'
              className='pl-10 pr-4 py-2 w-40 sm:w-48 md:w-60 border-2 border-gray-400 rounded-3xl focus:border-blue-500 focus:outline-none text-sm'
            />
            {showDropDown && (
              <div className='absolute top-10 -right-2 bg-white border border-gray-300 rounded-lg w-60 sm:w-64 shadow-md max-h-80 overflow-y-auto z-50'>
                {searchResults.length === 0 ? (
                  <p className='px-4 py-3 text-sm text-gray-500'>No users found</p>
                ) : (
                  searchResults.map((u) => (
                    <Link 
                      key={u._id} 
                      to={`/profile/${u._id}`} 
                      className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                      onClick={() => {
                        setSearchQuery("")
                        setShowDropDown(false)
                      }}
                    >
                      <div className='flex items-center gap-x-3'>
                        <div className='h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center'>
                          {u.avatar ? (
                            <img src={u.avatar} className='h-8 w-8 rounded-full object-cover' alt="User avatar"/>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                              <path fill="gray" d="M7.5 6.5C7.5 8.981 9.519 11 12 11s4.5-2.019 4.5-4.5S14.481 2 12 2S7.5 4.019 7.5 6.5M20 21h1v-1c0-3.859-3.141-7-7-7h-4c-3.86 0-7 3.141-7 7v1z"/>
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className='font-semibold text-left'>{u.firstName} {u.lastName || ""}</p>
                          <p className='text-xs text-gray-500 text-left'>@{u.username}</p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

          <button className='md:hidden' onClick={toggleMobileMenu}>
            <svg 
              className='w-6 h-6 fill-gray-600' 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24"
            >
              <path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/>
            </svg>
          </button>
        </div>
      </div>

      {showMobileMenu && (
        <div className='md:hidden bg-white border-t border-gray-200 py-4 px-4'>
          <nav className='flex flex-col gap-4'>
            <NavLink 
              to='/' 
              className={({isActive})=>`text-sm font-bold ${isActive ? "text-blue-500" : "text-gray-500 hover:text-blue-500"}`}
              onClick={() => setShowMobileMenu(false)}
            >
              HOME
            </NavLink>
            <NavLink 
              to='/about' 
              className={({isActive})=>`text-sm font-bold ${isActive ? "text-blue-500" : "text-gray-500 hover:text-blue-500"}`}
              onClick={() => setShowMobileMenu(false)}
            >
              ABOUT
            </NavLink>
            {user ? (
              <>
                <div className='flex items-center justify-center gap-x-2 text-sm font-bold text-gray-500'>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                    <g fill="none">
                      <path stroke="currentColor" strokeWidth="1.5" d="M21 12a8.96 8.96 0 0 1-1.526 5.016A8.99 8.99 0 0 1 12 21a8.99 8.99 0 0 1-7.474-3.984A9 9 0 1 1 21 12Z"/>
                      <path fill="currentColor" d="M13.25 9c0 .69-.56 1.25-1.25 1.25v1.5A2.75 2.75 0 0 0 14.75 9zM12 10.25c-.69 0-1.25-.56-1.25-1.25h-1.5A2.75 2.75 0 0 0 12 11.75zM10.75 9c0-.69.56-1.25 1.25-1.25v-1.5A2.75 2.75 0 0 0 9.25 9zM12 7.75c.69 0 1.25.56 1.25 1.25h1.5A2.75 2.75 0 0 0 12 6.25zM5.166 17.856l-.719-.214l-.117.392l.267.31zm13.668 0l.57.489l.266-.310l-.117-.393zM9 15.75h6v-1.5H9zm0-1.5a4.75 4.75 0 0 0-4.553 3.392l1.438.428A3.25 3.25 0 0 1 9 15.75zm3 6a8.23 8.23 0 0 1-6.265-2.882l-1.138.977A9.73 9.73 0 0 0 12 21.75zm3-4.5c1.47 0 2.715.978 3.115 2.32l1.438-.428A4.75 4.75 0 0 0 15 14.25zm3.265 1.618A8.23 8.23 0 0 1 12 20.25v1.5a9.73 9.73 0 0 0 7.403-3.405z"/>
                    </g>
                  </svg>
                  Hi, {user.firstName}
                </div>
                <div className='pl-6 flex flex-col gap-2'>
                  <Link 
                    to="/changeDetails" 
                    className='text-sm text-gray-500 hover:text-blue-500 border-t-1 border-gray-300'
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Change Account Details
                  </Link>
                  <Link 
                    to="/changePassword" 
                    className='text-sm text-gray-500 hover:text-blue-500 border-t-1 border-gray-300'
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Change Password
                  </Link>
                  <Link 
                    to="/account" 
                    className='text-sm text-gray-500 hover:text-blue-500 border-t-1 border-gray-300'
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Register
                  </Link>
                  <Link 
                    onClick={() => {
                      handleLogout()
                      setShowMobileMenu(false)
                    }} 
                    className='text-sm text-gray-500 hover:text-blue-500 border-t-1 border-gray-300'
                  >
                    Logout
                  </Link>
                </div>
              </>
            ) : (
              <button 
                onClick={() => {
                  handleSignUp()
                  setShowMobileMenu(false)
                }} 
                className='text-sm font-bold text-gray-500 hover:text-blue-500 flex items-center gap-x-2'
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                  <g fill="none">
                    <path stroke="currentColor" strokeWidth="1.5" d="M21 12a8.96 8.96 0 0 1-1.526 5.016A8.99 8.99 0 0 1 12 21a8.99 8.99 0 0 1-7.474-3.984A9 9 0 1 1 21 12Z"/>
                    <path fill="currentColor" d="M13.25 9c0 .69-.56 1.25-1.25 1.25v1.5A2.75 2.75 0 0 0 14.75 9zM12 10.25c-.69 0-1.25-.56-1.25-1.25h-1.5A2.75 2.75 0 0 0 12 11.75zM10.75 9c0-.69.56-1.25 1.25-1.25v-1.5A2.75 2.75 0 0 0 9.25 9zM12 7.75c.69 0 1.25.56 1.25 1.25h1.5A2.75 2.75 0 0 0 12 6.25zM5.166 17.856l-.719-.214l-.117.392l.267.31zm13.668 0l.57.489l.266-.310l-.117-.393zM9 15.75h6v-1.5H9zm0-1.5a4.75 4.75 0 0 0-4.553 3.392l1.438.428A3.25 3.25 0 0 1 9 15.75zm3 6a8.23 8.23 0 0 1-6.265-2.882l-1.138.977A9.73 9.73 0 0 0 12 21.75zm3-4.5c1.47 0 2.715.978 3.115 2.32l1.438-.428A4.75 4.75 0 0 0 15 14.25zm3.265 1.618A8.23 8.23 0 0 1 12 20.25v1.5a9.73 9.73 0 0 0 7.403-3.405z"/>
                  </g>
                </svg>
                SIGN UP
              </button>
            )}
          </nav>
        </div>
      )}
    </div>
  )
}

export default Header