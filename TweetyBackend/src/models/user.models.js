import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

let userSchema=new Schema({
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    firstName:{
        type: String,
        required: true,
        index: true,
        trim: true
    },
    lastName:{
        type: String,
        index: true,
        trim: true
    },
    password:{
        type: String,
        required: true
    },
    birthdate:{
        type: Date,
        required: true,
        validate: {
            validator: function(value){
                return value < new Date()
            },
            message: "Birthdate must be in past"
        }
    },
    username:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String
    },
    coverImage: {
        type: String
    },
    numberOfPosts:{
        type: Number,
        default: 0
    },
    followers:[{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
     following:[{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    refreshToken:{
        type: String,
    }
}, {timestamps: true})

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password || typeof this.password !== 'string') {
    return next();
  }
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.isPasswordCorrect = async function (password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Input password must be a non-empty string');
  }
  if (!this.password || typeof this.password !== 'string') {
    throw new Error('Stored password is missing or invalid');
  }
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            firstName: this.firstName,
            lastName: this.lastName,
            birthdate: this.birthdate        
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
            _id: this._id,     
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

userSchema.index({username: "text", firstName: "text", lastName: "text"})

export let User=mongoose.model("User", userSchema)


