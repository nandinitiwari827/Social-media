import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

let commentSchema=new Schema({
    comment:{
        type: String,
        required: true,
    },
    commentedBy:{
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    post:{
        type: Schema.Types.ObjectId,
        ref: "Post"
    },
    likes:[{
        type: Schema.Types.ObjectId,
        ref: "Like"
    }]
}, {timestamps: true})

commentSchema.plugin(mongooseAggregatePaginate)
export let Comment=mongoose.model("Comment", commentSchema)