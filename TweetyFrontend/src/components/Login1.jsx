import React, { useState, useContext } from 'react'
import UserContext from '../contexts/userContext'
import { useNavigate, Link } from 'react-router-dom'
import logo from "../assets/tweetyLogo.png"
import { checkEmailExists } from '../api.js'

function Login1() {
  let navigate=useNavigate()   
    
       let [errors, setErrors]=useState({email: '' })
       let [formData, setFormData]=useState({email: ''})
       let [isLoading, setIsLoading]=useState(false)

    let {setUser}=useContext(UserContext)

      let emailRegex = /^[\w.-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/

  let handleChange=(e)=>{
        let {name, value}=e.target
        setFormData({...formData, [name]: value})
        setErrors({...errors, [name]: ''})
    }

let handleContinue = async (e) => {
  e.preventDefault();
  setIsLoading(true)
  setErrors({email: ''})

  let newErrors={}
  if(!formData.email){
    newErrors.email='Required'
  }else if (!emailRegex.test(formData.email)) {
      newErrors.email = ''
    }

  if(Object.keys(newErrors).length>0){
    setErrors(newErrors)
    setIsLoading(false)
    return
  }

  try{
   await checkEmailExists(formData.email)
    navigate("/accountpage", { state: { email: formData.email } })

  }catch(err){
    let status=err.response?.status
    let backendError=err.response?.data?.message || "An error occurred while checking email."
    
  if (status === 409) { 
        setErrors({email: 'User with email already exists'})
      }  else {
        setErrors({email: backendError})
      }
  }finally{
    setIsLoading(false)
  }
}

  return (
    <>
  <div className='w-full min-h-screen bg-cover bg-no-repeat' style={{backgroundImage: `url("https://4kwallpapers.com/images/walls/thumbs_2t/10307.jpg")`}}>

  <div className='flex justify-center pt-6 sm:pt-12'>
    <img src={logo} className='h-16 sm:h-20 object-contain rounded-xl'/>
  </div>

  <div className='flex justify-center mt-6 sm:mt-8 px-4'>
    <div className='bg-white rounded-3xl w-full max-w-[600px] flex flex-col py-8 sm:py-14 px-6 sm:px-18 text-left mb-10 sm:mb-20'>
      
      <div className='flex items-center'>
        <p className='text-lg sm:text-xl font-semibold'>My</p>
        <img src={logo} className='h-10 sm:h-12'/>
      </div>

      <p className='text-2xl sm:text-3xl font-semibold pt-3'>Enter your email to continue</p>
      <p className='pt-3 text-sm sm:text-base'>Log in to tweety with your MyTweety account.
         If you don't have one, you will be prompted to create one.</p>

         <input 
         type='text'
         placeholder='Email'
         name='email'
         value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
         className={`${errors.email || (formData.email && !emailRegex.test(formData.email))? "border-red-600":"border-transparent hover:border-gray-400"} bg-gray-200 rounded-sm py-3 sm:py-4 pl-4 sm:pl-5 pr-5 sm:pr-6 mt-5 outline-none border-b-2 focus:border-black w-full max-w-[455px] mx-auto`}
         />

           {errors.email && (
                  <div className="text-red-600 text-xs sm:text-[13px] relative mt-2">{errors.email}</div>
                )} 

         {(formData.email && !emailRegex.test(formData.email)) && (<p className='text-xs sm:text-[13px] text-red-600 relative mt-2'>Email should be in valid format</p>)}
        
      <button 
        onClick={handleContinue} 
        disabled={isLoading}
        className={`${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} mt-6 duration-200 hover:bg-blue-700 focus:bg-blue-800 cursor-pointer text-white bg-blue-600 py-2 sm:py-3 rounded-3xl font-semibold w-full max-w-[455px] mx-auto`}>
        
        {isLoading ? 'Loading...' : 'Continue'}
      </button>

      <div className='flex flex-col border-t-1 border-gray-200 mt-7'>
        <p className='font-bold text-gray-500 text-sm sm:text-[15px] pt-6'>Tweety is a part of The Tweety Family of Companies.</p>
       
        <p className='text-xs sm:text-[13px] text-gray-500 pt-1'>Tweety is your go-to space to share thoughts, ideas, and moments — instantly and effortlessly. Inspired by the simplicity of tweets, Tweety lets you connect, express, and engage with people around the world. Whether it's a quick opinion, a trending update, or a casual chat, this is your digital stage.
         Speak your mind, follow what matters, and make every tweet count — with Tweety.</p>
      </div>

      <div className='mt-4 text-gray-600 flex items-center justify-center gap-x-2 text-sm sm:text-base'>Already registered? Please login. <Link to="/login" className='text-blue-500 hover:underline hover:text-blue-600'>Click here</Link></div>
    </div>
  </div>
</div>

    </>
  )
}

export default Login1