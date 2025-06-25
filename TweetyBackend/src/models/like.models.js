import mongoose, {Schema} from "mongoose";

let likeSchema=new Schema({
    post:{
        type: Schema.Types.ObjectId,
        ref: "Post"
    },
    likedBy:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
  },
}, {timestamps: true})

export let Like= mongoose.model("Like", likeSchema)