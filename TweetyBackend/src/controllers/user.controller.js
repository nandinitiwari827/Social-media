import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { Post } from "../models/post.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import mongoose, {isValidObjectId} from "mongoose";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

let generateAccessAndRefreshTokens=async(userId)=>{
    try{
        let user=await User.findById(userId)
        let accessToken=user.generateAccessToken()
        let refreshToken=user.generateRefreshToken()

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}
    
    }catch(error){
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}

let registerUser=asyncHandler(async(req, res)=>{
    let {firstName, lastName, email, username, birthdate, password, verifyPassword}=req.body

    // if(
    //     [firstName, lastName, email, username, birthdate, password, verifyPassword].some((field)=>field?.trim()==="")
    // ){
    //     throw new ApiError(400, "All fields are required")
    // }

    if(!firstName){
        throw new ApiError(400, "FirstName is required")
    }

      if(!email){
        throw new ApiError(400, "Email is required")
    }

      if(!username){
        throw new ApiError(400, "Please enter a username")
    }

      if(!birthdate){
        throw new ApiError(400, "Birthdate is required")
    }

      if(!password){
        throw new ApiError(400, "Password is required")
    }

      if(!verifyPassword){
        throw new ApiError(400, "Passwords should match")
    }

     if(password!==verifyPassword){
        throw new ApiError(409, "Passwords should be same")
    }

    let emailRegex=/^[\w.-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/

    if(!emailRegex.test(email)){
        throw new ApiError(400, "Please enter email in a valid format")
    }

    let passwordRegex=/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

    if(!passwordRegex.test(password)){
        throw new ApiError(400, "Password must be atleast 8 characters long, including 1 lowercase, 1 uppercase, 1 number and 1 special character")
    }

    let existedUser=await User.findOne({email})

    if(existedUser){
        throw new ApiError(409, "User with email already exists")
    }

    let existingUsername = await User.findOne({username});
   
    if (existingUsername) {
    throw new ApiError(409, "Username already exists");
    }

    // let avatarLocalPath=req.files?.avatar[0]?.path
    // let coverImageLocalPath=req.files?.coverImage[0]?.path

    // let avatar=avatarLocalPath? await uploadOnCloudinary(avatarLocalPath):null
    // let coverImage=coverImageLocalPath? await uploadOnCloudinary(coverImageLocalPath):null

    let user=await User.create({
        firstName,
        lastName: lastName || "",
        // avatar: avatar?.url || "",
        // coverImage: coverImage?.url || "",
        birthdate,
        password,
        email,
        username: username
    })

    let createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})

let loginUser=asyncHandler(async(req, res)=>{
    let {email, username, password}=req.body

    if(!username && !email){
        throw new ApiError(400, "Username or email is required")
    }

    let user=await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    let isPasswordValid=await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Incorrect password")
    }

    let {accessToken, refreshToken}=await generateAccessAndRefreshTokens(user._id)
    let loggedInUser=await User.findById(user._id).select("-password -refreshToken")

   let options={
    httpOnly: true,
    // secure: true
    secure: process.env.NODE_ENV === 'production',
   }

   return res.status(200).cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(new ApiResponse(200, {
    user: loggedInUser, accessToken, refreshToken
   },
   "User logged in Successfully"
))
})

let logoutUser = asyncHandler(async (req, res) => {
   
    let token=req.cookies?.accessToken

    if(!token){
        throw new ApiError(401, "No token provided")
    }

    let decodedToken
    try{
        decodedToken=jwt.decode(token)
        if(!decodedToken?._id){
            throw new ApiError(401, "Invalid token")
    }}catch(error){
        throw new ApiError(401, "Invalid token")
    }

    let user=await User.findById(decodedToken._id)
    if(!user){
        throw new ApiError(404, "User not found")
    }

        await User.findByIdAndUpdate(
       user._id,
        {
            $unset:{
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )   

    let options={
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out Successfully"))
   
})

let refreshAccessToken=asyncHandler(async(req, res)=>{
    let incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request")
    }

    try{
        let decodedToken=jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        let user=await User.findById(decodedToken?._id)

        if(!user){
            throw new ApiError(401, "Invalid refresh token")
        }

        if(incomingRefreshToken!==user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used")
        }

        let options={
            httpOnly: true,
            secure: true
        }

        let {accessToken, newRefreshToken}=await generateAccessAndRefreshTokens(user._id)

        return res.status(200).cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(200, {accessToken, refreshToken: newRefreshToken}, "Access token refreshed")
        )
    }catch(error){
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

let changeCurrentPassword=asyncHandler(async(req, res)=>{
     let {oldPassword, newPassword}=req.body

       if (!oldPassword || typeof oldPassword !== 'string' || oldPassword.trim() === '') {
    throw new ApiError(400, 'Old password is required and must be a non-empty string');
  }
  if (!newPassword || typeof newPassword !== 'string' || newPassword.trim() === '') {
    throw new ApiError(400, 'New password is required and must be a non-empty string');
  }

     let user=await User.findById(req.user?._id)
     if (!user) {
    throw new ApiError(404, 'User not found')
  }

  if (!user.password || typeof user.password !== 'string') {
    throw new ApiError(500, 'User password is missing or invalid in database')
  }
     let isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
 
     if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid old password")
     }

     let passwordRegex=/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

     if(!passwordRegex.test(newPassword)){
        throw new ApiError(400, "New password must be atleast 8 characters long, including 1 lowercase, 1 uppercase, 1 number and 1 special character")
     }

     user.password=newPassword
     user.save({validateBeforeSave: false})

     return res.status(200).json(new ApiResponse(200, {}, "Password updated successfully"))
})

let getCurrentUser=asyncHandler(async(req, res)=>{

    let user=await User.findById(req.user?._id)
    .populate("followers", "username firstName lastName avatar")
    .populate("following", "username firstName lastName avatar")
    .select("-password -refreshToken")
    .lean()

    if(!user){
        throw new ApiError(404, "User not exist")
    }

    let numberOfPosts=await Post.countDocuments({createdBy: user._id})
   if (!Array.isArray(user.followers)) {
  user.followers = [];
}
if (!Array.isArray(user.following)) {
  user.following = [];
}
    return res.status(200).json(new ApiResponse(200, {...user, numberOfPosts}, "Current user fetched successfully"))
})

let updateAccountDetails=asyncHandler(async(req, res)=>{
    let {firstName, lastName, email, username, birthdate}=req.body

    if(!firstName){
        throw new ApiError(400, "FirstName is required")
    }

      if(!email){
        throw new ApiError(400, "Email is required")
    }

      if(!username){
        throw new ApiError(400, "Please enter a username")
    }

      if(!birthdate){
        throw new ApiError(400, "Birthdate is required")
    }

     let emailRegex=/^[\w.-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/

    if(!emailRegex.test(email)){
        throw new ApiError(400, "Please enter email in a valid format")
    }

      let existedUser = await User.findOne({ email, _id: { $ne: req.user._id } });

    if(existedUser){
        throw new ApiError(408, "User with email already exists")
    }

     let existingUsername = await User.findOne({ username, _id: { $ne: req.user._id } });

    if (existingUsername) {
    throw new ApiError(409, "Username already exists");
    }

    lastName=lastName || ""

    let user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                firstName,
                lastName,
                username,
                email: email,
                birthdate
            }
        },
        {new: true}
    ).select("-password")

    return res.status(200).json(new ApiResponse(200, user, "Account details updated successfully"))
})

let updateAvatar=asyncHandler(async(req, res)=>{
let avatarLocalPath=req.file?.path

if(!avatarLocalPath){
    throw new ApiError(400, "Avatar file is missing")
}

let avatar=avatarLocalPath

let user=await User.findByIdAndUpdate(
    req.user?._id,
    {
        $set:{
            avatar: avatar.url
        }
    },
    {new: true}
).select("-password")

return res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully"))
})

let updateCoverImage=asyncHandler(async(req, res)=>{
    let coverImageLocalPath=req.file?.path

if(!coverImageLocalPath){
    throw new ApiError(400, "Cover Image file is missing")
}

let coverImage=await uploadOnCloudinary
(coverImageLocalPath)

if(!coverImage.url){
    throw new ApiError(400, "Error while uploading on cover Image")
}

let user=await User.findByIdAndUpdate(
    req.user?._id,
    {
        $set:{
            coverImage: coverImage.url
        }
    },
    {new: true}
).select("-password")

return res.status(200).json(new ApiResponse(200, user, "Cover Image updated successfully"))
})

let toggleFollow=asyncHandler(async(req, res)=>{
     let {userId}=req.params
        let currentUserId=req.user._id
    
        if(!isValidObjectId(userId)){
            throw new ApiError(400, "Invalid user Id")
        }
    
        if(userId===currentUserId.toString()){
            throw new ApiError(400, "You cannot follow yourself")
        }
    
        let userToToggle=await User.findById(userId)
        .select("_id username firstName lastName")
        
        if(!userToToggle){
            throw new ApiError(404, "User not found")
        }

        let currentUser=await User.findById(currentUserId)
        .select("_id username firstName lastName following")

        if(!currentUser){
            throw new ApiError(404, "Current user not found")
        }
    
       let isFollowing=currentUser.following.includes(userId)
    
       if (isFollowing) {
    await User.updateOne({ _id: currentUserId }, { $pull: { following: userId } });
    await User.updateOne({ _id: userId }, { $pull: { followers: currentUserId } });
  } else {
    await User.updateOne({ _id: currentUserId }, { $addToSet: { following: userId } });
    await User.updateOne({ _id: userId }, { $addToSet: { followers: currentUserId } });
  }

  const updatedUser = await User.findById(userId)
    .populate("followers", "username firstName lastName avatar")
    .populate("following", "username firstName lastName avatar");

  const updatedCurrentUser = await User.findById(currentUserId)
    .populate("followers", "username firstName lastName avatar")
    .populate("following", "username firstName lastName avatar");

  return res.status(200).json(
    new ApiResponse(200, {
      user: updatedUser,
      currentUser: updatedCurrentUser
    }, isFollowing ? "User unfollowed successfully" : "User followed successfully")
  )
})

let getFollowers=asyncHandler(async(req, res)=>{
    let {userId}=req.params
    
        if(!isValidObjectId(userId)){
            throw new ApiError(400, "Invalid user Id")
        }
    
        let user=await User.findById(userId)
           .populate({
            path: "followers",
            select: "username firstName lastName avatar"
        })
       
        if(!user){
            throw new ApiError(404, "User not found")
        }

        let numberOfFollowers = user.followers ? user.followers.length : 0
    
        return res.status(200).json(new ApiResponse(200, {numberOfFollowers, followers: user.followers}, "Followers fetched successfully"))
})

let getFollowing=asyncHandler(async(req, res)=>{
         let {userId}=req.params
    
        if(!isValidObjectId(userId)){
            throw new ApiError(400, "Invalid user Id")
        }
    
        let user=await User.findById(userId)
         .populate({
            path: "following",
            select: "username firstName lastName avatar"
        })
       
        if(!user){
            throw new ApiError(404, "User not found")
        }

        let numberOfFollowing = user.following ? user.following.length : 0
    
        return res.status(200).json(new ApiResponse(200, {numberOfFollowing, following: user.following}, "Following fetched successfully"))
})

let getUserProfile=asyncHandler(async(req, res)=>{
    let {userId}=req.params
     let user=await User.findById(userId)
     .populate("followers", "username firstName lastName avatar")
    .populate("following", "username firstName lastName avatar")
     .select("-password -refreshToken")
     .lean()

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user Id")
    }

    if(!user){
        throw new ApiError(404, "User not exist")
    }

    let numberOfPosts=await Post.countDocuments({createdBy: user._id})
  
    return res.status(200).json(new ApiResponse(200, {...user, numberOfPosts}, "User profile fetched successfully"))
})

let deleteAccount=asyncHandler(async(req, res)=>{
    let { userId }=req.params

    if(!userId){
        throw new ApiError(400, "User Id is required")
    }

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user Id")
    }

    let user=await User.findById(userId)

    if(!user){
        throw new ApiError(404, "User not found")
    }

    await User.updateMany(
        {followers: userId},
        {$pull: {followers: userId}}
    )

    await User.updateMany(
         {following: userId},
        {$pull: {following: userId}}
    )

    await Post.deleteMany({createdBy: userId})

    await User.findByIdAndDelete(userId)

    let options={
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Account deleted successfully"))
})

let checkEmailExists = asyncHandler(async (req, res) => {

    const { email } = req.body; 

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const existedUser = await User.findOne({ email });

    if (existedUser) {
        throw new ApiError(409, "User with email already exists");
    }

    return res.status(200).json(
        new ApiResponse(200, { email }, "Email is available")
    );
});

export {checkEmailExists, registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateAvatar, updateCoverImage, getUserProfile, getFollowers, getFollowing, toggleFollow, deleteAccount}