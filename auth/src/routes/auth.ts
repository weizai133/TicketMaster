import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { RequestValidationError } from "../errors/RequestValidationError";
import { BadRequestError } from "../errors/BadRequestError";
import UserModal from "../modals/users";

const router = express.Router();

router.post('/signup', 
  [
    body('email')
      .isEmail()
      .withMessage('Email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 characters')
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new RequestValidationError(errors.array());
    }

    const existUser = await UserModal.findOne({ email: req.body.email });

    if (existUser) {
      throw new BadRequestError('Email in use');
    }

    const user = UserModal.build({ ...req.body });
    await user.save();

    res.status(201).json(user); 
  }
)

export default router;