import React, {useContext} from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import UserContext from './contexts/userContext'

function PrivateRoute() {
    let {user}=useContext(UserContext)

    if(!user) return
    <Navigate to="/login"/>
  return <Outlet/> 
}

export default PrivateRoute