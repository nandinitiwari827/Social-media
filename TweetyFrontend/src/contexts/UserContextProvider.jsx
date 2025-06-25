import React from 'react'
import UserContext from './userContext'

let UserContextProvider=({children})=> {
    let [user, setUser]=React.useState({})
  return (
    <UserContext.Provider value={{user, setUser}}>
        {children}
    </UserContext.Provider>
  )
}

export default UserContextProvider