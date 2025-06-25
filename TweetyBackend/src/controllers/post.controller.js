import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { Post } from "../models/post.models.js";
import { Like } from "../models/like.models.js";
import { Comment } from "../models/comment.models.js";
import mongoose, {isValidObjectId} from "mongoose";
import jwt from "jsonwebtoken"

let uploadAvatar=asyncHandler(async(req, res)=>{
    let userId=req.user._id
    let avatarFile=req.files?.avatar?.[0]

    if(!avatarFile){
        throw new ApiError(400, "Avatar file is required")
    }
    
    let user=await User.findById(userId)
    
    if(!user){
        throw new ApiError(404, "User not found")
    } 

            let avatarUpload=await uploadOnCloudinary(avatarFile.path)
        
            if(!avatarUpload?.url){
                throw new ApiError(500, "Failed to upload avatar") 
            }

                let updatedUser=await User.findByIdAndUpdate(userId,
                    {$set: {avatar: avatarUpload.url}},
                    {new: true}
                ).select("-password -refreshToken").lean()

       return res.status(200).json(new ApiResponse(200, updatedUser, "Profile uploaded successfully")) 
})

let uploadCoverImage=asyncHandler(async(req, res)=>{
      let userId=req.user._id
    let coverImageFile=req.files?.coverImage?.[0]

    if(!coverImageFile){
        throw new ApiError(400, "Cover image file is required")
    }
    
    let user=await User.findById(userId)
    
    if(!user){
        throw new ApiError(404, "User not found")
    } 

            let coverImageUpload=await uploadOnCloudinary(coverImageFile.path)
           
            if(!coverImageUpload?.url){
                throw new ApiError(500, "Failed to upload cover image") 
            }

                let updatedUser=await User.findByIdAndUpdate(userId,
                    {$set: {coverImage: coverImageUpload.url}},
                    {new: true}
                ).select("-password -refreshToken").lean()

       return res.status(200).json(new ApiResponse(200, updatedUser, "Cover image uploaded successfully")) 
})

let deleteAvatar=asyncHandler(async(req, res)=>{
    let userId=req.user._id

    let user=await User.findById(userId)
    if(!user){
        throw new ApiError(404, "User not found")
    }

    let updatedUser=await User.findByIdAndUpdate(
        userId,
        {$set: {avatar: ""}},
        {new: true}
    ).select("-password -refreshToken").lean()

    return res.status(200).json(new ApiResponse(200, updatedUser, "Avatar deleted successfully"))
})

let deleteCoverImage=asyncHandler(async(req, res)=>{
     let userId=req.user._id

    let user=await User.findById(userId)
    if(!user){
        throw new ApiError(404, "User not found")
    }

    let updatedUser=await User.findByIdAndUpdate(
        userId,
        {$set: {coverImage: ""}},
        {new: true}
    ).select("-password -refreshToken").lean()

    return res.status(200).json(new ApiResponse(200, updatedUser, "Cover Image deleted successfully"))
})

let getAllPosts=asyncHandler(async(req, res)=>{
    let {page=1, limit=10, query, sortBy="createdAt", sortType="desc", userId}=req.query

    page=parseInt(page) || 1
    limit= parseInt(limit) || 10
    
    if(page<1 || limit<1){
        throw new ApiError(400, "Page and limit must be positive integers")
    }

    let filter={ isPosted: true}

    if(userId){
        if(!isValidObjectId(userId)){
            throw new ApiError(400, "Invalid user Id")
        }
        filter.createdBy=userId
    }

    if(query){
        filter.caption={$regex: query, $options: "i"}
    }

    let sortOrder=sortType.toLowerCase()==="asc"? 1: -1
    let sortObj={}
    sortObj[sortBy]=sortOrder

    let posts=await Post.find(filter)
    .skip((page-1)*limit)
    .limit(limit)
    .select("caption createdAt createdBy")
    .sort(sortObj)
    .populate("createdBy", "username firstName lastName avatar")
    .lean()

    let totalPosts=await Post.countDocuments(filter)

    return res.status(200).json(new ApiResponse(200,{
        posts, page, limit, totalPosts, totalPages: Math.ceil(totalPosts/limit),
    }, "Posts fetched successfully"))
})

let uploadPost=asyncHandler(async(req, res)=>{
    let {caption}=req.body

    let mediaFilePath=req.files?.mediaFile?.[0]
    
    if(!mediaFilePath){
         throw new ApiError(400, "Either image or video file is required")
    }

    let mediaUploadUrl=""

    if(mediaFilePath){
     let mediaUpload=await uploadOnCloudinary(mediaFilePath.path)
     if(!mediaUpload?.url){
        throw new ApiError(500, "Failed to upload media to cloudinary")
     }
     mediaUploadUrl=mediaUpload.url
    }

    let post=await Post.create({
        caption: caption ? caption.trim() : "",
        mediaFile: mediaUploadUrl,
        createdBy: req.user._id,
        isPosted: true
    })

    if(!post){
        throw new ApiError(500, "Failed to post")
    }
    return res.status(201).json(new ApiResponse(201, post, "Posted sucessfully"))
})

let editPost=asyncHandler(async(req, res)=>{
    let {newCaption}=req.body
    let {postId}=req.params

    if(!isValidObjectId(postId)){
        throw new ApiError(400, "Invalid post Id")
    }

    let post=await Post.findById(postId)

    if(!post){
        throw new ApiError(404, "Post not found")
    }

    if(!post.createdBy.equals(req.user._id)){
        throw new ApiError(403, "You are not authorized to edit this post")
    }

    post.caption=newCaption.trim()

    await post.save()

    return res.status(200).json(new ApiResponse(200, post, "Post edited successfully"))  
})

let getPostById = asyncHandler(async (req, res) => {
  let { postId } = req.params;

  if (!isValidObjectId(postId)) {
    throw new ApiError(400, "Invalid post Id");
  }

  let post = await Post.findById(postId)
    .populate("createdBy", "username firstName lastName avatar")
    .lean();

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const likes = await Like.find({ post: postId }).select("likedBy -_id").lean();
  const likeUserIds = likes.map(like => like.likedBy?.toString()).filter(Boolean);

  const comments = await Comment.find({ post: postId })
    .populate("commentedBy", "username avatar")
    .lean();

  post.likes = likeUserIds;
  post.comments = comments;

  return res
    .status(200)
    .json(new ApiResponse(200, post, "Post fetched successfully"));
});

let getUserPosts = asyncHandler(async (req, res) => {
  let { userId } = req.params

  if (!userId) {
    throw new ApiError(400, "User Id is required")
  }

  if (!isValidObjectId(userId)){
    throw new ApiError(403, "Invalid user Id")
  }

  let user = await User.findById(userId)

  if (!user) {
    throw new ApiError(404, "User not found")
  }

 let numberOfPosts = await Post.countDocuments({ createdBy: user._id });

  let posts = await Post.find({ createdBy: user._id })
    .populate("createdBy", "username firstName lastName avatar")
    .sort({ createdAt: -1 })
    .lean();

let postsWithLikes = await Promise.all(
posts.map(async (post) => {
    let likeDocs = await Like.find({ post: post._id }).select("likedBy").lean();
let likes = likeDocs
  .filter(like => like.likedBy)
  .map(like => like.likedBy.toString());

     let commentDocs = await Comment.find({ post: post._id }).select("commentedBy").lean();
let comments = commentDocs
  .filter(comment => comment.commentedBy)
  .map(comment => comment.commentedBy.toString());


      return {
        ...post,
        likes,  
       comments
      };
    })
  );

  return res.status(200).json(new ApiResponse(200, { posts: postsWithLikes, numberOfPosts },"Posts fetched successfully"));
})

let deletePost = asyncHandler(async(req, res)=>{
        let {postId}=req.params

    if(!isValidObjectId(postId)){
        throw new ApiError(400, "Invalid post Id")
    }

    let post=await Post.findById(postId)

    if(!post){
        throw new ApiError(404, "Post not found")
    }

    if(!post.createdBy.equals(req.user._id)){
        throw new ApiError(403, "You are not authorized to edit this post")
    }

    await Post.findByIdAndDelete(postId)

    return res.status(200).json(new ApiResponse(200, {}, "Post deleted successfully"))
})

export {uploadAvatar, uploadCoverImage, deleteAvatar, deleteCoverImage, uploadPost, editPost, deletePost, getPostById, getUserPosts, getAllPosts}
