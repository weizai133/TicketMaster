import { Publisher, Subjects, TicketCreatedEvent } from "@rayjson/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}