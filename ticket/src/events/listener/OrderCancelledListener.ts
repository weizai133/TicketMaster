import { Message } from "node-nats-streaming";
import { Listener, Subjects, OrderCancelledEvent } from "@rayjson/common";
import QueueGroupName from "./queueGroupName";
import { Ticket } from "../../model";
import { TicketUpdatePublisher } from "../publisher/TicketUpdatePublisher";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = QueueGroupName;

  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    console.log(data.ticket.id)
    const ticket = await Ticket.findById(data.ticket.id.toString());

    if (!ticket) throw new Error('Ticket is not found from Ticket SERVICE');

    ticket.set({ orderId: undefined });
    await ticket.save()
    await new TicketUpdatePublisher(this.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      orderId: ticket.orderId
    })
    msg.ack();
  }
}