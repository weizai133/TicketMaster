import { Publisher } from "./base-publisher";
import { TicketUpdateEvent } from "./TicketUpdateEvent";
import { Subjects } from "./Subjects";

export class TicketUpdatePublisher extends Publisher<TicketUpdateEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}