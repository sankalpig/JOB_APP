import mongoose from "mongoose";
import user from "./user.js";

const jobSchema = new mongoose.Schema({
  title : {
    type : String,
    trim : true,
    required : true
  },
  company : {
    type : String,
    trim : true,
    required : true
  },
  location : {
    type : String,
    required : true,
    trim : true
  },
  description : {
    type : String,
    required : true,
    trim : true
  },
  tags : {
    type : [String],
    required : true
  },
  postedBy : {
    type : mongoose.Schema.Types.ObjectId,
    ref : user
  },
  createdAt : {
    type : Date,
    default : Date.now
  },
  updatedAt : {
    type : Date,
    default : null
  }
})

export default mongoose.model("Job", jobSchema)