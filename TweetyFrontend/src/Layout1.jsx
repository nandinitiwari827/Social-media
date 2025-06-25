import React from 'react'
import About from './components/About'
import Footer from './components/Footer'
import { Outlet } from 'react-router-dom'

function Layout1() {
  return (
    <>
    <Outlet/>
    <Footer/>
    </>
  )
}

export default Layout1