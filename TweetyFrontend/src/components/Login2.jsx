import React, { useState, useContext } from 'react'
import UserContext from '../contexts/userContext'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import logo from '../assets/tweetyLogo.png'
import { registerUser } from '../api.js'

function Login2() {
    let navigate = useNavigate()
    let location = useLocation()

    let userEmail = location.state?.email || ""

    let [checked, setChecked]=useState(false)
    let [showPassword, setShowPassword]=useState(false)
    let [isLoading, setIsLoading]=useState(false)

    let [errors, setErrors]=useState({
        firstName: '',
        lastName: '',
        username: '',
        password: '',
        verifyPassword: '',
        birthdate: '',
        checked: ''
    })

    let [formData, setFormData]=useState({
        firstName: '',
        lastName: '',
        username: '',
        password: '',
        verifyPassword: '',
        birthdate: '',
    })

     let handleChange=(e)=>{
        let {name, value}=e.target
        setFormData({...formData, [name]: value})
        setErrors({...errors, [name]: ''})
    }

    let handleCheckboxChange=(e)=>{
        setChecked(e.target.checked)
        setErrors({...errors, checked: ''})
    }

       let {setUser}=useContext(UserContext)

    let passwordRegex=/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

      let handleAgree = async(e)=>{
      e.preventDefault()
      setIsLoading(true)
      setErrors({
        firstName: '',
        lastName: '',
        username: '',
        password: '',
        verifyPassword: '',
        birthdate: '',
        checked: ''
    })
      
        let newErrors={}
        if(!formData.firstName){
            newErrors.firstName='Please enter your first name.'
        }
        if(!formData.username){
            newErrors.username='Please enter a username.'
        }
        if(!formData.password){
            newErrors.password='Password is required.'
        }else if(formData.password && !passwordRegex.test(formData.password)){
            newErrors.password=''
        }
        if(!checked){
            newErrors.checked='Please accept our terms & conditions.'
        }
        if(!formData.birthdate){
            newErrors.birthdate='Birthdate is required.'
        }else if(new Date(formData.birthdate) >= new Date()){
            newErrors.birthdate=''
        }
        
        if(!formData.verifyPassword || formData.password !== formData.verifyPassword){
            newErrors.verifyPassword="The passwords don't match."
        }

    if(Object.keys(newErrors).length>0){
    setErrors(newErrors)
    setIsLoading(false)
    return
    }

    try{
        let registerData={
            email: userEmail,
            firstName: formData.firstName,
            lastName: formData.lastName,
            username: formData.username,
            password: formData.password,
            verifyPassword: formData.verifyPassword,
            birthdate: formData.birthdate,
        }

         let response=await registerUser(registerData)

    localStorage.setItem('accessToken', response.data.accessToken)
    localStorage.setItem('refreshToken', response.data.refreshToken)
    localStorage.setItem('user', JSON.stringify(response.data.user))
    setUser(response.data.user)
    navigate("/login")
   
   }catch(err){
     let status=err.response?.status
    let backendError=err.response?.data?.message || "An error occurred during register."
   
   if(status===409){
    setErrors({
        firstName: '',
        lastName: '',
        username: 'Username is already taken, please try another one',
        password: '',
        verifyPassword: '',
        birthdate: '',
        checked: ''
    })
   }else if (status === 400) {
        setErrors({
          firstName: '',
          lastName: '',
          username: '',
          password: '',
          verifyPassword: '',
          birthdate: '',
          checked: backendError 
        })
      }else{
    setErrors({
         firstName: '',
        lastName: '',
        username: '',
        password: '',
        verifyPassword: '',
        birthdate: '',
        checked: backendError
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

          <div className='flex items-center'>
            <p className='text-lg sm:text-xl font-semibold'>My</p>
            <img src={logo} className='h-10 sm:h-12'/>
          </div>
    
          <p className='text-2xl sm:text-3xl font-semibold pt-3'>Create an account to continue</p>
          <p className='pt-3 text-sm sm:text-base'>With a MyTweety account, you can log in to tweety and other services across The Tweety 
            Family of Companies. Create your account using <span className='font-bold'>{userEmail}</span> <Link to="/account" className='text-blue-600 hover:underline hover:text-blue-800'>edit.</Link></p>

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
         name="lastName"
         placeholder='Last Name'
         value={formData.lastName}
         onChange={handleChange}
         disabled={isLoading}
         className={`bg-gray-200 rounded-sm py-3 sm:py-4 pl-4 sm:pl-5 pr-5 sm:pr-6 outline-none border-b-2 border-transparent hover:border-b-2 focus:border-black focus:border-b-2 hover:border-gray-400 w-full max-w-[455px] mx-auto`}
         />

         <input 
         type='text'
         name='username'
         placeholder='Create a username'
         value={formData.username}
         onChange={handleChange}
         disabled={isLoading}
         className={`${errors.username? "border-red-600":"border-transparent hover:border-gray-400"} border-b-2 bg-gray-200 rounded-sm py-3 sm:py-4 pl-4 sm:pl-5 pr-5 sm:pr-6 outline-none focus:border-black w-full max-w-[455px] mx-auto`}/>
            
            {errors.username && (<p className="text-xs sm:text-[13px] text-red-600 relative bottom-4">{errors.username}</p> )}
        
         <div className='relative w-full max-w-[455px] mx-auto'>
          <input 
         type={showPassword? "text":"password"}
         name='password'
         placeholder='Choose a password'
         value={formData.password}
         onChange={handleChange}
         disabled={isLoading}
         className={`${errors.password || (formData.password && !passwordRegex.test(formData.password))? "border-red-600":"border-transparent hover:border-gray-400"} bg-gray-200 rounded-sm py-3 sm:py-4 pl-4 sm:pl-5 w-full outline-none border-b-2 focus:border-black`}
         />

        <button onClick={()=>setShowPassword(!showPassword)}
        className='absolute right-4 lg:right-[20px] sm:right-[45px] cursor-pointer top-[12px] sm:top-[16px]'>
            {showPassword? (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 36 36"><path fill="#858585" d="M33.62 17.53c-3.37-6.23-9.28-10-15.82-10S5.34 11.3 2 17.53l-.28.47l.26.48c3.37 6.23 9.28 10 15.82 10s12.46-3.72 15.82-10l.26-.48Zm-15.82 8.9C12.17 26.43 7 23.29 4 18c3-5.29 8.17-8.43 13.8-8.43S28.54 12.72 31.59 18c-3.05 5.29-8.17 8.43-13.79 8.43" class="clr-i-solid clr-i-solid-path-1"/><circle cx="18.09" cy="18.03" r="6.86" fill="#858585" class="clr-i-solid clr-i-solid-path-2"/><path fill="none" d="M0 0h36v36H0z"/></svg>)
            :(<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 36 36"><path fill="#858585" d="M18.37 11.17a6.8 6.8 0 0 0-2.37.43l8.8 8.8a6.8 6.8 0 0 0 .43-2.4a6.86 6.86 0 0 0-6.86-6.83" class="clr-i-solid clr-i-solid-path-1"/><path fill="#858585" d="M34.29 17.53c-3.37-6.23-9.28-10-15.82-10a16.8 16.8 0 0 0-5.24.85L14.84 10a14.8 14.8 0 0 1 3.63-.47c5.63 0 10.75 3.14 13.8 8.43a17.8 17.8 0 0 1-4.37 5.1l1.42 1.42a19.9 19.9 0 0 0 5-6l.26-.48Z" class="clr-i-solid clr-i-solid-path-2"/><path fill="#858585" d="m4.87 5.78l4.46 4.46a19.5 19.5 0 0 0-6.69 7.29l-.26.47l.26.48c3.37 6.23 9.28 10 15.82 10a16.9 16.9 0 0 0 7.37-1.69l5 5l1.75-1.5l-26-26Zm8.3 8.3a6.85 6.85 0 0 0 9.55 9.55l1.6 1.6a14.9 14.9 0 0 1-5.86 1.2c-5.63 0-10.75-3.14-13.8-8.43a17.3 17.3 0 0 1 6.12-6.3Z" class="clr-i-solid clr-i-solid-path-3"/><path fill="none" d="M0 0h36v36H0z"/></svg>)}  
        </button>
        </div>
         {errors.password && <p className='text-xs sm:text-[13px] text-red-600 relative bottom-4'>{errors.password}</p>}
         {formData.password && !passwordRegex.test(formData.password) && <p className='text-xs sm:text-[13px] text-red-600 relative bottom-4'>Password must be atleast 8 characters long, including 1 lowercase, 1 uppercase, 1 number and 1 special character.</p>}
            
         <input 
         type="password"
         name='verifyPassword'
         placeholder='Verify Password'
         value={formData.verifyPassword}
         onChange={handleChange}
         disabled={isLoading}
         className={`${errors.verifyPassword || (formData.password!==formData.verifyPassword)? "border-red-600":"border-transparent hover:border-gray-400"} bg-gray-200 rounded-sm py-3 sm:py-4 pl-4 sm:pl-5 pr-5 sm:pr-6 outline-none border-b-2 focus:border-black w-full max-w-[455px] mx-auto`}/>
      
       {(errors.verifyPassword || (formData.password!==formData.verifyPassword)) && (
  <p className='text-xs sm:text-[13px] text-red-600 relative bottom-4'>
    The passwords dont match
  </p>
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
   {errors.birthdate && (<p className='text-xs sm:text-[13px] text-red-600 relative top-2'>{errors.birthdate}</p>)}
   {(formData.birthdate && new Date(formData.birthdate) >= new Date()) && (<p className='text-xs sm:text-[13px] text-red-600 relative top-2'>Birthdate should be in past.</p>)}
</div>
            </div>

            <p className='text-sm font-bold'>Communications & Privacy</p>

            <div className='flex flex-col gap-y-2'>
            <label className='flex gap-x-5 mt-8'>
            <input 
            type='checkbox'
            name='checked'
            checked={checked}
            onChange={handleCheckboxChange}
            disabled={isLoading}
            className='h-8 w-8 sm:h-12 sm:w-12 rounded-2xl relative bottom-3'
            />
            <span className='text-xs sm:text-sm'>Yes! I would like to receive updates, special offers, and other information from tweety and The Tweety Family of Companies.</span>
        
            </label>
             {errors.checked && <p className='text-red-600 text-xs sm:text-[13px]'>{errors.checked}</p>}
             </div>

            <div className='text-xs sm:text-sm text-gray-500 mt-6'>By creating an account, I agree to the <Link to="#" className='underline hover:no-underline hover:text-black'>Terms of Use</Link> and acknowledge that 
                I have read the <Link to="#" className='underline hover:no-underline hover:text-black'>Privacy Policy.</Link></div>
    
    <button 
    onClick={handleAgree} 
    disabled={isLoading}
    className={`${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} cursor-pointer text-white bg-blue-600 py-2 sm:py-3 font-semibold mt-10 rounded-3xl duration-200 hover:bg-blue-700 focus:bg-blue-800 w-full max-w-[455px] mx-auto`}>
        {isLoading ? 'Loading...': "Agree & Continue"}
        </button>
    </div>
    </div>
    </div>
  )
}

export default Login2

