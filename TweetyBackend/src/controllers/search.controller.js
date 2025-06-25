import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, {isValidObjectId} from "mongoose";

let searchUsers=asyncHandler(async(req, res)=>{
    let {query}=req.query
    let loggedInUserId=req.user._id

    if(!query){
        throw new ApiError(400, "Query parameter is required")
    }

    let loggedInUser=await User.findById(loggedInUserId)
    .select("-password -refreshToken")
    .lean()

    if(!loggedInUser){
        throw new ApiError(404, "User does not exist")
    }

    let users=await User.find({
        $or: [
            {username: {$regex: query, $options: "i"}},
            {firstName: {$regex: query, $options: "i"}},
            {lastName: {$regex: query, $options: "i"}}
        ]
    }).select("username firstName lastName avatar email")

    if(!users || users.length===0){ 
        throw new ApiError(404, "No users found")
    }

    return res.status(200).json(new ApiResponse(200, users, "Users fetched successfully"))
})

export {searchUsers}