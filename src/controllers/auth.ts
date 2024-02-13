import { Request, Response } from "express"
import user from "../models/user.js"
import { ValidationChain, ValidationError, body, validationResult } from "express-validator"
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

interface signUpRequestBody {
  firstName : string,
  lastName : string,
  email : string,
  password : string,
  confirmPassword : string,
  contactNumber : string
}

interface loginRequestBody {
  email : string,
  password : string
}

async function checkErrors(validationRules: ValidationChain[], req: Request): Promise<string[] | null> {
  await Promise.all(validationRules.map(validation => validation.run(req)));

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return errors.array().map((error: ValidationError) => error.msg);
  }

  return null;
}

export const signUp = async (req: Request, res: Response) => {
  try {
    const { firstName, email, password, confirmPassword, contactNumber, lastName = ""} = req.body as signUpRequestBody;

    const validationRules = [
      body('firstName').isLength({min : 1}).withMessage("First Name is Required"),
      body('email').isEmail().withMessage("Invalid Email Address"),
      body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 Characters'),
      body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) throw new Error("Password and Confirm Password Do Not Match");
        return true;
      }),
      body('contactNumber').custom((value) => {
        if (!value || value.length !== 10) throw new Error("Contact Number must be of 10 digits");
        return true;
      })
    ];

    const validationErrors = await checkErrors(validationRules, req);

    if (validationErrors && validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        errors: validationErrors
      });
    }

    const userFound = await user.findOne({ email });
    if (userFound) {
      return res.status(300).json({
        success: false,
        message: "USER ALREADY EXISTS"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userDetails = await user.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      contactNumber
    });

    return res.status(200).json({
      success: true,
      message: "USER REGISTERED SUCCESSFULLY",
      data: userDetails
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "INTERNAL SERVER ERROR",
      error: err
    });
  }
};

export const login = async(req : Request, res : Response) => {
  try{
    const {email, password} = req.body as loginRequestBody;

    const validationRules = [
      body('email').isEmail().withMessage("Invalid Email Address")
    ];

    const validationErrors = await checkErrors(validationRules, req);

    if (validationErrors && validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        errors: validationErrors
      });
    }

    const userDetails = await user.findOne({ email });
    if (!userDetails) {
      return res.status(300).json({
        success: false,
        message: "USER NOT REGISTERED.... PLEASE LOGIN"
      });
    }

    if(await bcrypt.compare(password, userDetails.password)){
      const payload = {
        id : userDetails._id,
        email : userDetails.email,
        fullName : `${userDetails.firstName} ${userDetails.lastName}`,
        contactNumber : userDetails.contactNumber
      }

      const token = jwt.sign(payload, <string>process.env.JWT_SECRET, {expiresIn : "24H"})
      
      const options = {
        expires : new Date(Date.now() + 24 * 60 * 60 * 1000),
        httpOnly : true
      }

      return res.cookie("token", token, options).status(200).json({
        success : true,
        data : {
          email : userDetails.email,
          fullName : `${userDetails.firstName} ${userDetails.lastName}`,
          contactNumber : userDetails.contactNumber
        },
        token,
        message : "LOGGED IN SUCCESSFULLY"
      })
    } else {
      return res.status(401).json({
        success : false,
        message : "PASSWORD IS INCORRECT"
      })
    }
  
  }catch(err){
    return res.status(500).json({
      success: false,
      message: "INTERNAL SERVER ERROR",
      error: err
    });
  }
}