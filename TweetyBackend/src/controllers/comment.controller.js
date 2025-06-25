import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { Post } from "../models/post.models.js";
import { Like } from "../models/like.models.js";
import { Comment } from "../models/comment.models.js";
import mongoose, {isValidObjectId} from "mongoose";
import jwt from "jsonwebtoken";

let addComment=asyncHandler(async(req, res)=>{
    let {postId}=req.params
    let {comment}=req.body

    if(!isValidObjectId(postId)){
        throw new ApiError(400, "Invalid post Id")
    }

    if(!comment || typeof comment!=="string" || comment.trim().length===0){
        throw new ApiError(400, "Comment content is required and must be non empty string")
    }

    let post=await Post.findById(postId)

    if(!post){
        throw new ApiError(404, "Post not found")
    }

    let comments=await Comment.create({
        comment: comment.trim(),
        post: postId,
        commentedBy: req.user._id
    })

    let createdComment= await Comment.findById(comments._id)
    .populate("commentedBy", "username firstName lastName avatar")

    return res.status(201).json(new ApiResponse(200, createdComment, "Comment added successfully"))
})

let deleteComment=asyncHandler(async(req, res)=>{
    let {commentId, postId}=req.params

    if(!isValidObjectId(postId)){
        throw new ApiError(400, "Invalid post Id")
    }
   
    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment Id")
    }

      let post=await Post.findById(postId)

    if(!post){
        throw new ApiError(404, "Post not found")
    }

    let comment=await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(404, "Comment not found")
    }

 if (
    (!comment.commentedBy || !comment.commentedBy.equals(req.user._id)) &&
    (!post.createdBy || !post.createdBy.equals(req.user._id))
  ) {
    throw new ApiError(403, "You are not authorized to delete this comment");
  }

    await Comment.findByIdAndDelete(commentId)

    return res.status(200).json(new ApiResponse(200, null, "Comment deleted successfully"))

})

let getPostComments = asyncHandler(async (req, res) => {
  let { postId } = req.params;
  let { page = 1, limit = 10 } = req.query;

  if (!isValidObjectId(postId)) {
    throw new ApiError(400, "Invalid post Id");
  }

  let post = await Post.findById(postId)
    .lean();

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  let pageNum = parseInt(page, 10);
  let limitNum = parseInt(limit, 10);
  if (pageNum < 1 || limitNum < 1) {
    throw new ApiError(400, "Page and limit must be positive integers");
  }

   let postLikes = await Like.find({ post: postId, comment: null }).lean();
  let postLikesArray = postLikes.map(like => like.likedBy.toString());

  let totalComments = await Comment.countDocuments({ post: postId });

  let comments = await Comment.find({ post: postId })
    .populate("commentedBy", "username firstName lastName avatar")
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .lean();

     await Promise.all(
    comments.map(async (comment) => {
        let commentLikes = await Like.find({ comment: comment._id }).lean();
      comment.likes = commentLikes.map(like => like.likedBy.toString());
    })
  );

  post.likes = postLikesArray
  post.comments = [totalComments]

  let response = {
    post,
    comments,
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalComments / limitNum),
    },
  };

  return res.status(200).json(new ApiResponse(200, response, "Post details with comments fetched successfully"));
});

let getLikedComments = asyncHandler(async (req, res) => {
  let { postId } = req.params;

  if (!isValidObjectId(postId)) {
    throw new ApiError(400, "Invalid post Id");
  }

  let post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  let comments = await Comment.find({ post: postId })
  .lean();

  let commentIds = comments.map(c => c._id);

  let likes = await Like.find({ comment: { $in: commentIds } })
    .populate("comment", "content") 
    .populate("likedBy", "username firstName lastName avatar")
    .lean();

  let likedCommentsWithCount = await Promise.all(
    likes.map(async (like) => {
      let likeCount = await Like.countDocuments({ comment: like.comment._id });
      return {
        ...like,
        likes: likeCount.toString()
      };
    })
  );

  return res.status(200).json(new ApiResponse(200, {
    postId,
    likedComments: likedCommentsWithCount
  }, "Liked comments of post fetched successfully"));
})

export {addComment, deleteComment, getPostComments, getLikedComments}