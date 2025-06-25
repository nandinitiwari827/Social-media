import React, {createContext, useContext, useState} from 'react'

let HeartContext=createContext()

export let useHeart=()=>useContext(HeartContext)


export function HeartContextProvider({children}) {
    let [heart, setHeart]=useState([])

    let heartLiked=(postId)=>{
        setHeart((prev)=>{
            if(prev.includes(postId)){
                return prev.filter((id)=>id!==postId)
            }else{
                return [...prev, postId]
            }
        })
    }

  return (
    <HeartContext.Provider value={{heart, heartLiked}}>
        {children}
    </HeartContext.Provider>
  )
}