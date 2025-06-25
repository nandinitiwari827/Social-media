import React, { useState, useContext } from 'react'
import UserContext from '../contexts/userContext'
import { useNavigate } from 'react-router-dom'
import logo from "../assets/tweetyLogo.png"
import { logoutUser, changeCurrentPassword } from '../api.js'

function ChangePassword() {
  let navigate=useNavigate()

  let {user}=useContext(UserContext)
  console.log("User in ChangePassword:", user)

   let [errors, setErrors]=useState({
       oldPassword: '',
       newPassword: '',
       verifyNewPassword: ''
    })
 
    let [formData, setFormData]=useState({
        oldPassword: '',
        newPassword: '',
        verifyNewPassword: ''
    })

    let [isLoading, setIsLoading]=useState(false)
    let [showPassword, setShowPassword]=useState(false)
      
     let passwordRegex=/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

    let handleChange=(e)=>{
        let {name, value}=e.target
        setFormData({...formData, [name]: value})
        setErrors({...errors, [name]: ''})
    }

    let handleSubmit=async(e)=>{
  e.preventDefault();
  setIsLoading(true)
  setErrors({
        oldPassword: '',
        newPassword: '',
        verifyNewPassword: ''
    })

  let newErrors={}
  if(!formData.oldPassword || formData.oldPassword.trim() === ''){
    newErrors.oldPassword='Please enter your old password.'
  }

  if(!formData.newPassword || formData.newPassword.trim() === ''){
    newErrors.newPassword="New Password is required."
  }else if(formData.newPassword && !passwordRegex.test(formData.newPassword)){
            newErrors.newPassword=''
  }else if(formData.oldPassword===formData.newPassword){
        newErrors.newPassword='Old password and new password cannot be same.'
    }

   if(!formData.verifyNewPassword || formData.newPassword !== formData.verifyNewPassword){
    newErrors.verifyNewPassword="The passwords don't match."
  }

  if(Object.keys(newErrors).length>0){
    setErrors(newErrors)
    setIsLoading(false)
    return
  }

  try{
    await changeCurrentPassword(formData.oldPassword, formData.newPassword) 

    await logoutUser()
    localStorage.removeItem('user')
    navigate('/login')
    
  }catch(err){
      console.error('Password change error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      })
  let status=err.response?.status
  let backendError=err.response?.data?.message || "Incorrect Password."

  if(status===400){
      setErrors({
            oldPassword: 'Incorrect Password',
            newPassword: '',
            verifyNewPassword: ''
      })
  }else{
      setErrors({
            oldPassword: backendError,
            newPassword: '',
            verifyNewPassword: ''
      })
  }
}
finally{
    setIsLoading(false)
  }
    }

  return (
   <div className='w-full min-h-screen bg-cover bg-no-repeat' style={{backgroundImage: `url("https://4kwallpapers.com/images/walls/thumbs_2t/10307.jpg")`}}>
      
        <div className='flex justify-center pt-6 sm:pt-12'>
          <img src={logo} className='h-16 sm:h-20 object-contain rounded-xl'/>
        </div>
      
        <div className='flex justify-center mt-6 sm:mt-8 px-4'>
          <div className='bg-white rounded-3xl w-full max-w-[600px] flex flex-col py-8 sm:py-14 px-6 sm:px-18 text-left mb-10 sm:mb-20'>
  
                <button onClick={()=>navigate("/")} className='absolute cursor-pointer right-8 lg:right-[360px] sm:right-[170px] md:right-[250px] top-[140px] sm:top-[180px] group'>
          <svg 
          xmlns="http://www.w3.org/2000/svg" width="24" height="24" sm:width="30" sm:height="30" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/>
          <path className='fill-gray-600 group-hover:fill-black duration-200'
          fill="currentColor" d="M10.772 2.688a2 2 0 0 1 2.456 0l8.384 6.52c.753.587.337 1.792-.615 1.792H20v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8h-.997c-.953 0-1.367-1.206-.615-1.791zM5.625 9.225c.229.185.375.468.375.785V19h12v-8.99c0-.317.146-.6.375-.785L12 4.267z"/></g></svg>
        </button>
            
            <div className='flex items-center'>
              <p className='text-lg sm:text-xl font-semibold'>My</p>
              <img src={logo} className='h-10 sm:h-12'/>
            </div>
      
            <p className='text-xl sm:text-2xl font-semibold pt-3'>Change password for your account here</p>
  
              <div className='flex flex-col w-full justify-center gap-y-6 mt-8 mb-6'>
         
          <input 
           type='text'
           name='oldPassword'
           placeholder='Old password'
           value={formData.oldPassword}
           onChange={handleChange}
           disabled={isLoading}
           className={`${errors.oldPassword ? "border-red-600":"border-transparent hover:border-gray-400"} border-b-2 bg-gray-200 rounded-sm py-3 sm:py-4 pl-4 sm:pl-5 pr-5 sm:pr-6 outline-none focus:border-black w-full max-w-[455px] mx-auto`}
           />
              {errors.oldPassword && <p className='text-xs sm:text-[13px] text-red-600 relative bottom-4'>{errors.oldPassword}</p>}

           <div className='relative w-full max-w-[455px] mx-auto'>
            <input 
           type={showPassword? "text":"password"}
           name='newPassword'
           placeholder='Create a new password'
           value={formData.newPassword}
           onChange={handleChange}
           disabled={isLoading}
           className={`${errors.newPassword || (formData.newPassword && !passwordRegex.test(formData.newPassword))? "border-red-600":"border-transparent hover:border-gray-400"} bg-gray-200 rounded-sm py-3 sm:py-4 pl-4 sm:pl-5 w-full outline-none border-b-2 focus:border-black`}
           />
  
          <button onClick={()=>setShowPassword(!showPassword)}
          className='absolute right-4 lg:right-[20px] sm:right-[45px] cursor-pointer top-[12px] sm:top-[16px]'>
              {showPassword? (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 36 36"><path fill="#858585" d="M33.62 17.53c-3.37-6.23-9.28-10-15.82-10S5.34 11.3 2 17.53l-.28.47l.26.48c3.37 6.23 9.28 10 15.82 10s12.46-3.72 15.82-10l.26-.48Zm-15.82 8.9C12.17 26.43 7 23.29 4 18c3-5.29 8.17-8.43 13.8-8.43S28.54 12.72 31.59 18c-3.05 5.29-8.17 8.43-13.79 8.43" class="clr-i-solid clr-i-solid-path-1"/><circle cx="18.09" cy="18.03" r="6.86" fill="#858585" class="clr-i-solid clr-i-solid-path-2"/><path fill="none" d="M0 0h36v36H0z"/></svg>)
              :(<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 36 36"><path fill="#858585" d="M18.37 11.17a6.8 6.8 0 0 0-2.37.43l8.8 8.8a6.8 6.8 0 0 0 .43-2.4a6.86 6.86 0 0 0-6.86-6.83" class="clr-i-solid clr-i-solid-path-1"/><path fill="#858585" d="M34.29 17.53c-3.37-6.23-9.28-10-15.82-10a16.8 16.8 0 0 0-5.24.85L14.84 10a14.8 14.8 0 0 1 3.63-.47c5.63 0 10.75 3.14 13.8 8.43a17.8 17.8 0 0 1-4.37 5.1l1.42 1.42a19.9 19.9 0 0 0 5-6l.26-.48Z" class="clr-i-solid clr-i-solid-path-2"/><path fill="#858585" d="m4.87 5.78l4.46 4.46a19.5 19.5 0 0 0-6.69 7.29l-.26.47l.26.48c3.37 6.23 9.28 10 15.82 10a16.9 16.9 0 0 0 7.37-1.69l5 5l1.75-1.5l-26-26Zm8.3 8.3a6.85 6.85 0 0 0 9.55 9.55l1.6 1.6a14.9 14.9 0 0 1-5.86 1.2c-5.63 0-10.75-3.14-13.8-8.43a17.3 17.3 0 0 1 6.12-6.3Z" class="clr-i-solid clr-i-solid-path-3"/><path fill="none" d="M0 0h36v36H0z"/></svg>)}  
          </button>
          </div>
           {errors.newPassword && <p className='text-xs sm:text-[13px] text-red-600 relative bottom-4'>{errors.newPassword}</p>}
           {formData.newPassword && !passwordRegex.test(formData.newPassword) && <p className='text-xs sm:text-[13px] text-red-600 relative bottom-4'>New password must be atleast 8 characters long, including 1 lowercase, 1 uppercase, 1 number and 1 special character.</p>}
              
           <input 
           type="password"
           name='verifyNewPassword'
           placeholder='Verify New Password'
           value={formData.verifyNewPassword}
           onChange={handleChange}
           disabled={isLoading}
           className={`${errors.verifyNewPassword || (formData.newPassword && formData.newPassword !== formData.verifyNewPassword)? "border-red-600":"border-transparent hover:border-gray-400"} bg-gray-200 rounded-sm py-3 sm:py-4 pl-4 sm:pl-5 pr-5 sm:pr-6 outline-none border-b-2 focus:border-black w-full max-w-[455px] mx-auto`}/>
         
         {(errors.verifyNewPassword || (formData.newPassword && formData.newPassword !== formData.verifyNewPassword)) && (
    <p className='text-xs sm:text-[13px] text-red-600 relative bottom-4'>
      The passwords don't match.
    </p>
  )}
       </div>
  
              <p className='text-sm font-bold'>Communications & Privacy</p>
      
      <button 
      onClick={handleSubmit} 
      disabled={isLoading} 
      className={`${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} cursor-pointer text-white bg-blue-600 py-2 sm:py-3 font-semibold mt-10 rounded-3xl duration-200 hover:bg-blue-700 focus:bg-blue-800 w-full max-w-[455px] mx-auto`}>
      {isLoading? 'Submitting...' : 'Submit'}
      </button>
      </div>
      </div>
      </div>
    )
}
export default ChangePassword