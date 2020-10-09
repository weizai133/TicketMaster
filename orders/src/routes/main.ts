import express, { Request, Response } from "express";
import { body } from "express-validator";
import mongoose from "mongoose";
import { Ticket } from "../models/ticket";
import { Order } from "../models/order";
import { requireAuth, validateRequest, NotFoundError, CredentialError, BadRequestError, OrderStatus } from "@rayjson/common";
import { natsWrapper } from "../nats-wrapper";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";

const EXPIRATION_SECONDS = 15 * 60;
const router = express.Router();

router.get('/', requireAuth, async (req: Request, res: Response) => {
  const orders = await Order.find({ userId : req.currentUser!.id }).populate('ticket');

  return res.status(200).json(orders);
});

router.get('/:orderId', requireAuth, async (req: Request, res: Response) => {
  if (!req.params.orderId) throw new BadRequestError('Order Id is required');

  const order = await Order.findById(req.params.orderId)

  if (!order) throw new NotFoundError();

  return res.status(200).send(order);
})

router.post('/', 
  requireAuth,
  [
    body('ticketId')
      .not()
      .notEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('TicketId must be provided')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { body } = req
    const existedTicket = await Ticket.findById(body.ticketId)

    if (!existedTicket) throw new Error('Ticket is not found from Order Service');

    const isReserved = await existedTicket.isReserved()
    if (isReserved) {
      throw new BadRequestError('Ticket is reserved');
    }

    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_SECONDS);
    
    const newOrder =  Order.build({ ticket: body.ticketId, userId: req.currentUser!.id, status: OrderStatus.Created, expiresAt: expiration });
    await newOrder.save();

    await new OrderCreatedPublisher(natsWrapper.client).publish({ 
      id: newOrder.id, 
      version: newOrder.version,
      userId: req.currentUser!.id, 
      ticket: { id: existedTicket.id, title: existedTicket.title, price: existedTicket.price }, 
      expiresAt: newOrder.expiresAt.toISOString(), 
      status: OrderStatus.Created 
    });

    res.status(201).send(newOrder); 
  }
)

// Cancel Order
router.delete('/:orderId', requireAuth, async (req: Request, res: Response) => {
  if (!req.params.orderId) throw new BadRequestError('Order Id is required');

  const order = await Order.findById(req.params.orderId).populate('ticket');
  if (!order) throw new Error('Order is not found');
  else if (order.userId !== req.currentUser!.id) throw new CredentialError();

  order.status = OrderStatus.Cancelled;
  await order.save();

  await new OrderCancelledPublisher(natsWrapper.client).publish({ 
    id: order.id,
    version: order.version,
    ticket: {
      id: order.ticket.id,
      price: order.ticket.price,
      title: order.ticket.title
    }
  });

  res.status(200).json(order);
});

router.get('/getTicketById/:ticketId', async (req: Request, res: Response) => {
  const ticket = await Ticket.findOne({ _id: req.params.ticketId });

  if (!ticket) throw new Error('Ticket is not found from ORDER Service');

  return res.status(200).json(ticket);
});

export default router;