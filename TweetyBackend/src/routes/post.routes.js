import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {uploadAvatar, uploadCoverImage, deleteAvatar, deleteCoverImage, getAllPosts, uploadPost, getPostById, getUserPosts, editPost, deletePost} from "../controllers/post.controller.js";

let router=Router()

router.route("/upload-avatar").post(
    verifyJWT,
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }
    ]),
    uploadAvatar
)

router.route("/upload-coverImage").post(
    verifyJWT,
    upload.fields([
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    uploadCoverImage
)

router.route("/delete-avatar").delete(verifyJWT, deleteAvatar)

router.route("/delete-coverImage").delete(verifyJWT, deleteCoverImage)

router.route("/").get(getAllPosts).post(
    verifyJWT,
    upload.fields([
        {
            name: "mediaFile",
            maxCount: 1
        },
    ]),
    uploadPost
)
router.route("/:postId").get(getPostById).patch(verifyJWT, editPost).delete(verifyJWT, deletePost)
router.route("/user/:userId").get(verifyJWT, getUserPosts)

export default router