import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

let app=express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "500mb"}))
app.use(express.urlencoded({extended: true, limit: "500mb"}))
app.use(express.static("public"))
app.use(cookieParser())

import userRouter from "./routes/user.routes.js"
import postRouter from "./routes/post.routes.js"
import likeRouter from "./routes/like.routes.js"
import commentRouter from "./routes/comment.routes.js"
import searchRouter from "./routes/search.routes.js"

app.use("/api/v1/users", userRouter)
app.use("/api/v1/posts", postRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/search", searchRouter)

export {app}

