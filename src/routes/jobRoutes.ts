import express from "express";
import { createJob, filterJob } from "../controllers/job.js";
import { auth } from "../middleware/auth.js";

const router = express.Router()

router.post('/createJob', auth, createJob)

router.post('/filterJob', auth, filterJob)

export default router