import { Request, Response } from "express";
import { ValidationChain, ValidationError, body, validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import user from "../models/user.js";
import job from "../models/job.js";

interface JobDetailsRequestBody {
  title: string;
  company: string;
  location: string;
  description: string;
  tags: string[];
}

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

async function checkErrors(validationRules: ValidationChain[], req: Request): Promise<string[] | null> {
  await Promise.all(validationRules.map(validation => validation.run(req)))

  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return errors.array().map((error: ValidationError) => error.msg)
  }

  return null
}

export const createJob = async (req: Request, res: Response) => {
  try {
    const { title, company, location, description, tags } = req.body as JobDetailsRequestBody;

    const validationRules = [
      body('title').isLength({min : 1}).withMessage("Title is Required"),
      body('company').isLength({min : 1}).withMessage("Company is Required"),
      body('location').isLength({min : 1}).withMessage("Location is Required"),
      body('description').isLength({min : 1}).withMessage("Description is Required"),
      body('tags').isArray().withMessage("Tags are required")
    ];

    const validationErrors = await checkErrors(validationRules, req);

    if (validationErrors && validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        errors: validationErrors
      });
    }

    const { user: userDetails } = req as AuthenticatedRequest;

    const userData = await user.findById(userDetails.id);

    if (!userData) {
      return res.status(400).json({
        success: false,
        message: "INVALID USER"
      });
    }

    const jobDetails = await job.create({
      title,
      company,
      location,
      description,
      tags,
      postedBy: userDetails.id,
    });

    return res.status(200).json({
      success: true,
      message: "SUCCESS",
      data: jobDetails
    });

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: "INTERNAL SERVER ERROR",
      error: err.message
    });
  }
}

export const filterJob = async (req: Request, res: Response) => {
  try {
    const { title, company, location, description, tags } = req.body as JobDetailsRequestBody;

    if (!title && !company && !location && !description && (!tags || tags.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "ANY ONE FILTER IS REQUIRED: TITLE, COMPANY, LOCATION, DESCRIPTION, TAGS"
      });
    }
    
    const { user: userDetails } = req as AuthenticatedRequest;

    const userData = await user.findById(userDetails.id);

    if (!userData) {
      return res.status(400).json({
        success: false,
        message: "INVALID USER"
      });
    }

    const jobDetails = await job.find({
      $or: [
        { title },
        { company },
        { location },
        { description },
        { tags: { $in: tags } }
      ]
    });

    return res.status(200).json({
      success: true,
      message: "SUCCESS",
      data: jobDetails
    });

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: "INTERNAL SERVER ERROR",
      error: err.message
    });
  }
}
