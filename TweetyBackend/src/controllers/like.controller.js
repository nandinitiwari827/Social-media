import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { Post } from "../models/post.models.js";
import { Like } from "../models/like.models.js";
import { Comment } from "../models/comment.models.js";
import mongoose, {isValidObjectId} from "mongoose";
import jwt from "jsonwebtoken";

let togglePostLike = asyncHandler(async (req, res) => {
  let { postId } = req.params

  if (!isValidObjectId(postId)) {
    throw new ApiError(400, "Invalid post Id");
  }

  let post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  let existingLike = await Like.findOne({
    post: postId,
    likedBy: req.user._id
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
  } else {
    await Like.create({
      post: postId,
      likedBy: req.user._id
    });
  }

  let updatedLikes = await Like.find({ post: postId }).select("likedBy -_id").lean();
  let likeUserIds = updatedLikes.map(like => like.likedBy.toString());

  return res.status(200).json(new ApiResponse(200, { likes: likeUserIds }, "Post like toggled"));
})

let toggleCommentLike=asyncHandler(async(req, res)=>{
        let { commentId, postId }=req.params

 const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "Comment not found");

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await existingLike.deleteOne();
  } else {
    await Like.create({
      comment: commentId,
      likedBy: req.user._id,
    });
  }

  const updatedLikes = await Like.find({ comment: commentId });
  const likeUserIds = updatedLikes.map(like => like.likedBy.toString());

  return res.status(200).json(
    new ApiResponse(200, { likes: likeUserIds }, "Comment like toggled")
  );
})

let getLikedPosts=asyncHandler(async(req, res)=>{

    let user=await User.findById(req.user?._id).select("-password -refreshToken")
            .select("_id username firstName lastName createdAt")
        .lean();

         if (!user) throw new ApiError(404, "User not found");

  user.numberOfPosts =  await Post.countDocuments({ createdBy: user._id });
    
    let likedPosts=await Like.find({
        likedBy: req.user._id,
        post: {$ne: null}
    })
    .populate({
        path: "post",
        select: "caption createdBy url",
        populate:{
            path: "createdBy",
            select: "username avatar firstName lastName"
        }
    }).lean()

    let posts=likedPosts.filter((like)=>like.post).map((like)=>like.post)

   let postsWithLikeCounts=await Promise.all(
    posts.map(async(post)=>{
        let likes=await Like.countDocuments({post: post._id})
        return {
            postId: post._id,
            caption: post.caption,
            url: post.url,
            createdBy: post.likedBy,
            likes
        }
    })
   )

   let numberOfLikedPosts=likedPosts.length

    return res.status(200).json(new ApiResponse(200, {user, likedPosts: postsWithLikeCounts, numberOfLikedPosts}, "Liked Posts fetched successfully"))
})

let getPostLikes = asyncHandler(async (req, res) => {
  let { postId } = req.params;
 
  if (!isValidObjectId(postId)) {
    throw new ApiError(400, "Invalid post Id");
  }

  let post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  if (!post.createdBy.equals(req.user._id)) {
    throw new ApiError(403, "You can't see the likes here")
  }

  let likes = await Like.find({ post: postId })
    .populate("likedBy", "firstName lastName username avatar")
    .lean();

  let likedByUsers = likes.map(like => ({
    firstName: like.likedBy.firstName,
    lastName: like.likedBy.lastName || "",
    username: like.likedBy.username,
    avatar: like.likedBy.avatar
  }));

  let likeCount = [likes.length]

  return res.status(200).json(
    new ApiResponse(200, {
      postId,
      likeCount,       
      likes: likedByUsers
    }, "Post likes fetched successfully")
  );
})

let getCommentLikes=asyncHandler(async(req, res)=>{
    let {postId, commentId}=req.params

    if(!isValidObjectId(postId) || !isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid post or comment Id")
    }

    let post=await Post.findById(postId)

    if(!post){
        throw new ApiError(404, "Post not found")
    }

    if(!post.createdBy.equals(req.user._id)){
        throw new ApiError(403, "Your are not authorized to see the comment like list.")
    }

   let comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404, "Comment not found")
    }

     if (comment.post.toString() !== postId) {
    throw new ApiError(400, "Comment does not belong to the specified post");
  }

  let likes = await Like.find({ comment: commentId })
    .populate("likedBy","firstName lastName username avatar").lean()

 let likedUsers = likes.map(like => ({
    firstName: like.likedBy.firstName,
    lastName: like.likedBy.lastName || "",
    username: like.likedBy.username,
    avatar: like.likedBy.avatar
  }));


    let likeCount=likedUsers.length

    return res.status(200).json(new ApiResponse(200, {postId, commentId, likeCount, likes: likedUsers}, "Comment likes fetched successfully"))
})

export {getPostLikes, togglePostLike, toggleCommentLike, getLikedPosts, getCommentLikes}