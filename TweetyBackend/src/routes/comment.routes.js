import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getPostComments, getLikedComments } from "../controllers/comment.controller.js";

let router=Router()
router.use(verifyJWT)

router.route("/post/:postId").post(addComment)
router.route("/post/:postId/:commentId").delete(verifyJWT, deleteComment)
router.route("/post-comments/:postId").get(getPostComments)
router.route("/liked-comments/:postId").get(getLikedComments)

export default router