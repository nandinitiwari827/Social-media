import React, { useState, useContext, useRef, useEffect } from 'react'
import UserContext from '../contexts/userContext'
import { useNavigate } from 'react-router-dom'
import logo from "../assets/tweetyLogo.png"
import { updateAccountDetails, logoutUser } from '../api.js'

function ChangeDetails() {
     let navigate = useNavigate()
    let [isLoading, setIsLoading]=useState(false)

    let [errors, setErrors]=useState({
        email: '',
        firstName: '',
        lastName: '',
        username: '',
        birthdate: '',
    })

    let [formData, setFormData]=useState({
        email: '',
        firstName: '',
        lastName: '',
        username: '',
        birthdate: '',
    })

     let handleChange=(e)=>{
        let {name, value}=e.target
        setFormData({...formData, [name]: value})
        setErrors({...errors, [name]: ''})
    }

       let {setUser}=useContext(UserContext)

    let emailRegex = /^[\w.-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/

      let handleSubmit = async(e)=>{
      e.preventDefault()
      setIsLoading(true)
      setErrors({
        email: '',
        firstName: '',
        lastName: '',
        username: '',
        birthdate: '',
    })
      
        let newErrors={}
        if(!formData.email){
          newErrors.email='Please enter your email.'
        }else if (!emailRegex.test(formData.email)) {
          newErrors.email = ''
            }
        if(!formData.firstName){
            newErrors.firstName='Please enter your first name.'
        }
        if(!formData.username){
            newErrors.username='Please enter a username.'
        }
        if(!formData.birthdate){
            newErrors.birthdate='Birthdate is required.'
        }else if(new Date(formData.birthdate) >= new Date()){
            newErrors.birthdate=''
        }

    if(Object.keys(newErrors).length>0){
    setErrors(newErrors)
    setIsLoading(false)
    return
    }

    try{
        let updateData={
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            username: formData.username,
            birthdate: formData.birthdate,
        }

         let response=await updateAccountDetails(updateData)

    localStorage.setItem('user', JSON.stringify(response.data.user))
    setUser(response.data.user)
     await logoutUser();
     localStorage.removeItem('user')
     navigate('/login');
    navigate("/login")
   
   }catch(err){
     let status=err.response?.status
    let backendError=err.response?.data?.message || "An error occurred while updating details."
   
    if(status===408){
      setErrors({
        email: 'User with email already exists',
        firstName: '',
        lastName: '',
        username: '',
        birthdate: '',
    })
     }
     else if (status === 400) {
        setErrors({
          email: backendError,
          firstName: '',
          lastName: '',
          username: '',
          birthdate: '', 
        })
      }else{
    setErrors({
        email: backendError,
         firstName: '',
        lastName: '',
        username: '',
        birthdate: '',
       })
      }
    } finally {
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

              <button onClick={()=>navigate("/")} className='absolute cursor-pointer  right-8 lg:right-[360px] sm:right-[170px] md:right-[250px] top-[140px] sm:top-[180px] group'>
        <svg 
        xmlns="http://www.w3.org/2000/svg" width="24" height="24" sm:width="30" sm:height="30" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/>
        <path className='fill-gray-600 group-hover:fill-black duration-200'
        fill="currentColor" d="M10.772 2.688a2 2 0 0 1 2.456 0l8.384 6.52c.753.587.337 1.792-.615 1.792H20v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8h-.997c-.953 0-1.367-1.206-.615-1.791zM5.625 9.225c.229.185.375.468.375.785V19h12v-8.99c0-.317.146-.6.375-.785L12 4.267z"/></g></svg>
      </button>
          
          <div className='flex items-center'>
            <p className='text-lg sm:text-xl font-semibold'>My</p>
            <img src={logo} className='h-10 sm:h-12'/>
          </div>
    
          <p className='text-xl sm:text-2xl font-semibold pt-3'>Change your account details here.</p>

            <div className='flex flex-col w-full justify-center gap-y-6 mt-8 mb-6'>
                 
        <input 
         type='text'
         name='firstName'
         placeholder='First Name'
         value={formData.firstName}
         onChange={handleChange}
         disabled={isLoading}
         className={`${errors.firstName? "border-red-600":"border-transparent hover:border-gray-400"} border-b-2 bg-gray-200 rounded-sm py-3 sm:py-4 pl-4 sm:pl-5 pr-5 sm:pr-6 outline-none focus:border-black w-full max-w-[455px] mx-auto`}/>
            {errors.firstName && <p className='text-xs sm:text-[13px] text-red-600 relative bottom-4'>{errors.firstName}</p>}

          <input 
         type='text'
         name='lastName'
         placeholder='Last Name'
         value={formData.lastName}
         onChange={handleChange}
         disabled={isLoading}
         className={`bg-gray-200 rounded-sm py-3 sm:py-4 pl-4 sm:pl-5 pr-5 sm:pr-6 outline-none border-b-2 border-transparent hover:border-b-2 focus:border-black focus:border-b-2 hover:border-gray-400 w-full max-w-[455px] mx-auto`}
         />

             <input 
         type='text'
         name='email'
         placeholder='Email'
         value={formData.email}
         onChange={handleChange}
         disabled={isLoading}
         className={`${errors.email || (formData.email && !emailRegex.test(formData.email))? "border-red-600":"border-transparent hover:border-gray-400"} border-b-2 bg-gray-200 rounded-sm py-3 sm:py-4 pl-4 sm:pl-5 pr-5 sm:pr-6 outline-none focus:border-black w-full max-w-[455px] mx-auto`}/>
            {errors.email && <p className='text-xs sm:text-[13px] text-red-600 relative bottom-4'>{errors.email}</p>}
            {(formData.email && !emailRegex.test(formData.email)) && <p className='text-xs sm:text-[13px] text-red-600 relative bottom-4'>Email should be in valid format</p>}

          <input 
         type='text'
         name='username'
         placeholder='Username'
         value={formData.username}
         onChange={handleChange}
         disabled={isLoading}
         className={`${errors.username? "border-red-600":"border-transparent hover:border-gray-400"} border-b-2 bg-gray-200 rounded-sm py-3 sm:py-4 pl-4 sm:pl-5 pr-5 sm:pr-6 outline-none focus:border-black w-full max-w-[455px] mx-auto`}/>
                        {errors.username && (
                            <p className="text-xs sm:text-[13px] text-red-600 relative bottom-4">{errors.username}</p>
                        )}
        
<div className="relative w-full max-w-[455px] mx-auto">
  <input
    type="date"
    name='birthdate'
    value={formData.birthdate}
    onChange={handleChange}
    disabled={isLoading}
    className={`peer bg-gray-200 rounded-sm py-3 sm:py-4 pl-4 sm:pl-5 pr-5 sm:pr-6 outline-none border-b-2 w-full 
        ${errors.birthdate || (formData.birthdate && new Date(formData.birthdate) >= new Date()) ? "border-red-600" : "border-transparent hover:border-gray-400 focus:border-black"}`}
  />
  <label
    className={`absolute left-4 sm:left-5 top-1 text-gray-500 text-xs sm:text-xs`}>
    Birthdate
  </label>
   {errors.birthdate && (<p className='text-xs sm:text-[13px] text-red-600 relative top-3 sm:top-2'>Birthdate should be</p>)}
   {(formData.birthdate && new Date && new Date(formData.birthdate) >= new Date()) && (<p className='text-xs sm:text-[13px] text-red-600 relative top-3 sm:top-2'>Birthdate should be in past.</p>)}
</div>
            </div>

            <p className='text-sm font-bold'>Communications</p>
    
    <button 
    onClick={handleSubmit}
    disabled={isLoading}
    className={`${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} bg-blue-600 cursor-pointer text-white py-2 sm:py-3 font-semibold mt-6 rounded-3xl duration-3 hover:bg-blue-700 focus:border-blue-600 w-full max-w-[455px] mx-auto`}>
      {isLoading ? 'Submitting...' : 'Submit'}
      </button>
    </div>
    </div>
    </div>
  )
}

export default ChangeDetails