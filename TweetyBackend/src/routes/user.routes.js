import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { checkEmailExists, registerUser, loginUser, logoutUser, getCurrentUser, updateAccountDetails, updateAvatar, updateCoverImage, changeCurrentPassword, refreshAccessToken, getFollowers, getFollowing, toggleFollow, getUserProfile, deleteAccount} from "../controllers/user.controller.js";

let router=Router()

router.route("/register").post(upload.none(), registerUser)

router.route('/check-email').post(checkEmailExists)

router.route("/login").post(loginUser)

router.route("/logout").post(logoutUser, verifyJWT)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/current-user").get(verifyJWT,getCurrentUser)

router.route("/change-password").post(verifyJWT, changeCurrentPassword)

router.route("/update-account").patch(verifyJWT, updateAccountDetails)

router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar)

router.route("/update-coverImage").patch(verifyJWT, upload.single("coverImage"), updateCoverImage)

router.route("/:userId").get(getUserProfile)

router.route("/user/:userId/follow").post(verifyJWT, toggleFollow)

router.route("/user/:userId/followers").get(getFollowers)

router.route("/user/:userId/following").get(getFollowing)

router.route("/delete-account/:userId").delete(verifyJWT, deleteAccount)

export default router
