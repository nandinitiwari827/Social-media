import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

let postSchema=new Schema({
    createdBy:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    caption:{
        type: String,
    },
    mediaFile:{
        type: String,
        required: true
    },
    isPosted:{
        type: Boolean,
        default: true
    },
    likes:[{
        type: Schema.Types.ObjectId,
        ref: "Like"
    }
    ],
    comments:[{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }]
}, {timestamps: true})

postSchema.plugin(mongooseAggregatePaginate)
export let Post=mongoose.model("Post", postSchema)