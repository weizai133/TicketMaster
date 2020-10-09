import { Message } from "node-nats-streaming";
import { Listener, Subjects, OrderCreatedEvent } from "@rayjson/common";
import QueueGroupName from "./queueGroupName";
import { Ticket } from "../../model";
import { TicketUpdatePublisher } from "../publisher/TicketUpdatePublisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = QueueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id);

    if (!ticket) throw new Error('Tickect not found');

    ticket.set({ orderId: data.id });

    await ticket.save();
    await new TicketUpdatePublisher(this.client).publish({ 
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      orderId: data.id
    });

    msg.ack();
  }
}