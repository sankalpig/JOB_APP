import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()

export const dbConnect = () => {
  mongoose.connect(<string>process.env.MONGODB_URI)
    .then(() => console.log("DB CONNECTED SUCCESSFULLY"))
    .catch(err => {
      console.log("ERROR WHILE CONNECTING TO DB", err)
      process.exit(1)
    })
}

