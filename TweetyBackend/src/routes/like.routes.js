import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { toggleCommentLike, togglePostLike, getLikedPosts, getPostLikes, getCommentLikes } from "../controllers/like.controller.js";

let router=Router()
router.use(verifyJWT)

router.route("/post/:postId").post(togglePostLike).get(getPostLikes)
router.route("/comment/:postId/:commentId").post(toggleCommentLike).get(getCommentLikes)
router.route("/liked-posts").get(getLikedPosts)

export default router