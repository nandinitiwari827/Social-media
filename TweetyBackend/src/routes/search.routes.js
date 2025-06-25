import { Router } from "express";
import { searchUsers } from "../controllers/search.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

let router=Router()
router.use(verifyJWT)

router.route("/").get(searchUsers)

export default router