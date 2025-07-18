import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js";

export let verifyJWT=asyncHandler(async(req, _, next)=>{
     try{
        let token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")

        if(!token){
            throw new ApiError(401, "Unauthorized request")
        }

        let decodedToken=jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        let user=await User.findById(decodedToken?._id).select("-password -refreshToken")

        if(!user){
            throw new ApiError(401, "Invalid Access Token")
        }

        req.user=user
        next()
     }catch(error){
        throw new ApiError(401, error?.message || "Invalid Access Token")
     }
})