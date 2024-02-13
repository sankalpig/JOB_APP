import express, { Request, Response } from "express"
import { dbConnect } from "./config/database.js"
import userRoutes from './routes/authRoutes.js'
import jobRoutes from './routes/jobRoutes.js'
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import helmet from "helmet"
dotenv.config()

const app = express()
app.use(express.json())
app.use(cookieParser())
dbConnect()
const PORT = process.env.PORT

app.use(helmet())

app.use('/user', userRoutes)
app.use('/job', jobRoutes)

app.use('/', (req:Request, res: Response) => {
  res.send("JOB APP GO TO POSTMAN")
})

app.listen(4000, () => {
  console.log(`SERVER IS WORKING AT PORT ${PORT}`)
})