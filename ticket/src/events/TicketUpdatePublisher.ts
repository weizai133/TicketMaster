import { Subjects, TicketUpdateEvent, Publisher } from "@rayjson/common";

export class TicketUpdatePublisher extends Publisher<TicketUpdateEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}

