import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { Password } from "../services/password";
import { RequestValidationError, BadRequestError, currentUser } from "@rayjson/common";
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
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_KEY!, { expiresIn: '20s' });

    res.status(201).json({ id: user.id, email: user.email, token });
  }
)

router.post('/signIn', 
   [
    body('email')
    .isEmail()
    .withMessage('Email must be valid'),
    body('password')
    .trim()
    .isEmpty()
    .withMessage('Password must be valid')
  ],
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existedUser = await UserModal.findOne({ email });

    if (!existedUser) {
      throw new BadRequestError('Invalid credential');
    }

    const passwordMatch = await Password.compare(password, existedUser.password.toString());

    if (!passwordMatch) {
      throw new BadRequestError('Invalid credential');
    }

    const token = jwt.sign({ id: existedUser.id, email: existedUser.email }, process.env.JWT_KEY!, { expiresIn: '1h' });

    res.status(200).send({ token, email: existedUser.email, id: existedUser.id });
  }
)

router.get('/currentUser', currentUser, (req: Request, res: Response) => {
  if (!req.headers.token) {
    return res.status(200).send({ currentUser: null });
  }

  const { token } = req.headers;
  try {
    const payload = jwt.verify(token as string, process.env.JWT_KEY!);
    res.json({ currentUser: payload });
  } catch (error) {
    res.json({ currentUser: null });
  }
});

export default router;