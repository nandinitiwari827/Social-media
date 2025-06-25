import React, { useState, useContext } from 'react'
import UserContext from '../contexts/userContext'
import { useNavigate, Link } from 'react-router-dom'
import logo from "../assets/tweetyLogo.png"
import { loginUser } from '../api.js'

function Login() {
 let navigate=useNavigate()

     let [showPassword, setShowPassword]=useState(false)
  
    let [errors, setErrors]=useState({
        identifier: '',
        password: ''
    })
 
    let [formData, setFormData]=useState({
        identifier: '',
        password: '',
    })

    let [isLoading, setIsLoading]=useState(false)

    let handleChange=(e)=>{
        let {name, value}=e.target
        setFormData({...formData, [name]: value})
        setErrors({...errors, [name]: ''})
    }

let handleLogin = async (e) => {
  e.preventDefault();
  setIsLoading(true)
  setErrors({identifier: '', password: ''})

  let newErrors={}
  if(!formData.identifier){
    newErrors.identifier='Email or username is required'
  }

  if(!formData.password){
    newErrors.password="Password is required"
  }

  if(Object.keys(newErrors).length>0){
    setErrors(newErrors)
    setIsLoading(false)
    return
  }

  try{
    let loginData={
        [formData.identifier.includes('@') ? 'email' : 'username']: formData.identifier,
        password: formData.password,
    }
    console.log('Sending login request with payload: ', loginData)
    let response=await loginUser(loginData)
    console.log('Login successfully: ',response)

    localStorage.setItem('accessToken', response.data.accessToken)
    localStorage.setItem('refreshToken', response.data.refreshToken)
    localStorage.setItem('user', JSON.stringify(response.data.user))
    navigate("/")

  }catch(err){
    let status=err.response?.status
    let backendError=err.response?.data?.message || "An error occurred during login."
    
    if(status===404){
        setErrors({identifier: 'User does not exist', password: ''})
    }else if(status===401){
        setErrors({identifier: '', password: 'Incorrect password'})
    }else{
        setErrors({identifier: backendError, password: ''})
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
     
      <p className='pt-3 text-sm sm:text-base'>Log in to tweety with your MyTweety account.</p>
       
       <div className='flex flex-col w-full justify-center gap-y-6 mt-4'>

          {errors.identifier==='User does not exist' && (
                  <div className="text-red-600 text-base sm:text-lg relative flex w-full justify-center">{errors.identifier}</div>
                )}
        <input 
         type='text'
         name='identifier'
         placeholder='Email or username'
         value={formData.identifier}
          onChange={handleChange}
          disabled={isLoading}
         className={`${(errors.identifier==='User does not exist' || errors.identifier==='Email or username is required') ? "border-red-600" : "border-transparent hover:border-gray-400"} bg-gray-200 rounded-sm py-3 sm:py-4 pl-4 sm:pl-5 w-full max-w-[455px] outline-none border-b-2 focus:border-black mx-auto`}
         />
              {errors.identifier==='Email or username is required' && (
                  <div className="text-red-600 text-xs sm:text-[13px] relative bottom-4">{errors.identifier}</div>
                )}

         <div className='relative w-full max-w-[455px] mx-auto'>
          <input 
         type={showPassword? "text":"password"}
         name='password'
         placeholder='Password'
         value={formData.password}
         onChange={handleChange}
         disabled={isLoading}
         className={` ${(errors.password || errors.identifier==='User does not exist')? "border-red-600" : "border-transparent hover:border-gray-400"} bg-gray-200 rounded-sm py-3 sm:py-4 pl-4 sm:pl-5 w-full outline-none border-b-2 focus:border-black`}
         />

        <button onClick={()=>setShowPassword(!showPassword)}
        className='absolute right-2 lg:right-[20px] sm:right-[45px] cursor-pointer top-[12px] sm:top-[16px]'>
            {showPassword? (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 36 36"><path fill="#858585" d="M33.62 17.53c-3.37-6.23-9.28-10-15.82-10S5.34 11.3 2 17.53l-.28.47l.26.48c3.37 6.23 9.28 10 15.82 10s12.46-3.72 15.82-10l.26-.48Zm-15.82 8.9C12.17 26.43 7 23.29 4 18c3-5.29 8.17-8.43 13.8-8.43S28.54 12.72 31.59 18c-3.05 5.29-8.17 8.43-13.79 8.43" class="clr-i-solid clr-i-solid-path-1"/><circle cx="18.09" cy="18.03" r="6.86" fill="#858585" class="clr-i-solid clr-i-solid-path-2"/><path fill="none" d="M0 0h36v36H0z"/></svg>)
            :(<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 36 36"><path fill="#858585" d="M18.37 11.17a6.8 6.8 0 0 0-2.37.43l8.8 8.8a6.8 6.8 0 0 0 .43-2.4a6.86 6.86 0 0 0-6.86-6.83" class="clr-i-solid clr-i-solid-path-1"/><path fill="#858585" d="M34.29 17.53c-3.37-6.23-9.28-10-15.82-10a16.8 16.8 0 0 0-5.24.85L14.84 10a14.8 14.8 0 0 1 3.63-.47c5.63 0 10.75 3.14 13.8 8.43a17.8 17.8 0 0 1-4.37 5.1l1.42 1.42a19.9 19.9 0 0 0 5-6l.26-.48Z" class="clr-i-solid clr-i-solid-path-2"/><path fill="#858585" d="m4.87 5.78l4.46 4.46a19.5 19.5 0 0 0-6.69 7.29l-.26.47l.26.48c3.37 6.23 9.28 10 15.82 10a16.9 16.9 0 0 0 7.37-1.69l5 5l1.75-1.5l-26-26Zm8.3 8.3a6.85 6.85 0 0 0 9.55 9.55l1.6 1.6a14.9 14.9 0 0 1-5.86 1.2c-5.63 0-10.75-3.14-13.8-8.43a17.3 17.3 0 0 1 6.12-6.3Z" class="clr-i-solid clr-i-solid-path-3"/><path fill="none" d="M0 0h36v36H0z"/></svg>)}  
        </button>

         {errors.password && (
            <div className="text-xs sm:text-[13px] text-red-600 pt-2">{errors.password}</div>
            )}
        </div> 
       </div>
        
      <button 
        onClick={handleLogin}
        disabled={isLoading} 
        className={`${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                 } mt-6 duration-200 hover:bg-blue-700 focus:bg-blue-800 cursor-pointer text-white bg-blue-600 py-2 sm:py-3 rounded-3xl font-semibold w-full max-w-[455px] mx-auto`}>
       
        {isLoading ? 'Logging in...' : 'Login'}
      </button>

      <div className='flex flex-col border-t-1 border-gray-200 mt-7'>
        <p className='font-bold text-gray-500 text-sm sm:text-[15px] pt-6'>Tweety is a part of The Tweety Family of Companies.</p>
       
        <p className='text-xs sm:text-[13px] text-gray-500 pt-1'>Tweety is your go-to space to share thoughts, ideas, and moments — instantly and effortlessly. Inspired by the simplicity of tweets, Tweety lets you connect, express, and engage with people around the world. Whether it's a quick opinion, a trending update, or a casual chat, this is your digital stage.
         Speak your mind, follow what matters, and make every tweet count — with Tweety.</p>
      </div>

      <div className='mt-4 text-gray-600 flex items-center justify-center gap-x-2 text-sm sm:text-base'>Not registered yet? Please register. <Link to="/account" className='text-blue-500 hover:underline hover:text-blue-600'>Click here</Link></div>
    </div>
  </div>
</div>

    </>
  )
}

export default Login







