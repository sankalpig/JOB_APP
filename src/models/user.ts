import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email : {
    type : String,
    required : true,
  },
  password : {
    type : String,
    required : true
  },
  firstName : {
    type : String,
    required : true,
    trim : true
  },
  lastName : {
    type : String,
    trim : true,
  },
  contactNumber : {
    type : Number,
    required : true
  },
  createdAt : {
    type : Date,
    default : Date.now
  }
})

export default mongoose.model("User", userSchema)