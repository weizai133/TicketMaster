import { Subjects } from "./Subjects";

export interface TicketUpdateEvent {
  subject: Subjects.TicketUpdated,
  data: {
    id: string,
    title: string,
    price: number,
    version: number
  }
}