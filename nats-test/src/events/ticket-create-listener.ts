import { Message, Stan } from "node-nats-streaming";
import { Listener } from "./base-listener";
import { TicketCreatedEvent } from "./TicketCreatedEvent";
import { Subjects } from "./Subjects";

export class TicketCreateListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queueGroupName = 'orders-service';
  
  onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    console.log('Event DATA:', data);

    msg.ack();
  }
}