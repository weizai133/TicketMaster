import express, { Request, Response } from "express";
import { body } from "express-validator";
import { Ticket } from "../modal";
import { requireAuth, validateRequest, NotFoundError, BadRequestError, CredentialError } from "@rayjson/common";

const router = express.Router();

router.post('/create', 
requireAuth, 
[
  body('title').not().isEmpty().withMessage('Title is required'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be provided and greater than 0')
],
validateRequest,
async (req: Request, res: Response) => {
  const { title, price } = req.body;
  const newTicket = Ticket.build({ userId: req.currentUser!.id, title, price });
  await newTicket.save()
  return res.status(201).json({ id: newTicket.id, title, price });
});

router.get('/:id', async (req: Request, res: Response) => {
  const existedTicket = await Ticket.findById(req.params.id);

  if (!existedTicket) throw new NotFoundError();

  return res.status(200).send(existedTicket);
});

router.get('/', async (req: Request, res: Response) => {
  const allTickets = await Ticket.find();

  res.status(200).json(allTickets);
});

router.put('/:id', requireAuth, 
[
  body('title').not().isEmpty().withMessage('Title is required'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be provided and greater than 0')
],
validateRequest,
async (req: Request, res: Response) => {
  const existedTicket = await Ticket.findById(req.params.id);
  
  if (!existedTicket) throw new NotFoundError();

  if (existedTicket.userId !== req.currentUser?.id) throw new CredentialError();

  const result = await Ticket.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true});

  res.status(200).json(result);
});

export default router;

