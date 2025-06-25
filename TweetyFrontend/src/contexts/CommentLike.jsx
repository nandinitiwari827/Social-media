import React, {createContext, useContext, useState} from 'react'

let CommentLikeContext=createContext()

export let useCommentLike=()=>useContext(CommentLikeContext)


export function CommentLikeContextProvider({children}) {
    let [commentLike, setCommentLike]=useState([])

    let commentLiked=(commentId)=>{
        setCommentLike((prev)=>{
            if(prev.includes(commentId)){
                return prev.filter((id)=>id!==commentId)
            }else{
                return [...prev, commentId]
            }
        })
    }

  return (
    <CommentLikeContext.Provider value={{commentLike, commentLiked}}>
        {children}
    </CommentLikeContext.Provider>
  )
}