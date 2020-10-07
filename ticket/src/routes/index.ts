import express, { Request, Response } from "express";
import { body } from "express-validator";
import { Ticket, TicketProps } from "../modal";
import { requireAuth, validateRequest, NotFoundError, CredentialError } from "@rayjson/common";
import { TicketCreatedPublisher } from "../events/TicketCreatedPublisher";
import { TicketUpdatePublisher } from "../events/TicketUpdatePublisher";
import { natsWrapper } from "../nats-wrapper";

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
  await new TicketCreatedPublisher(natsWrapper.client).publish({ id: newTicket.id, title: newTicket.title, price: newTicket.price, userId: newTicket.userId });

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

  const result = await Ticket.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true }) as TicketProps;
  await new TicketUpdatePublisher(natsWrapper.client).publish({ id: result.id, title: result.title, price: result.price, userId: result.userId })

  res.status(200).json(result);
});

export default router;