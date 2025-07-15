import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // hashed
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {_id:this._id,
        email:this.email,
        username:this.username,
    },
        process.env.REFRESH_TOKEN_SECRET || "refresh_secret",
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
    )
}

userSchema.methods.generateAccessToken = function() {
  return jwt.sign(
    { _id: this._id,},
    process.env.ACCESS_TOKEN_SECRET || "access_secret",
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
  );
}

export const User = mongoose.model('User', userSchema);
