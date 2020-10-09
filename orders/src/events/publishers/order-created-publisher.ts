import { Publisher, OrderCreatedEvent, Subjects } from '@rayjson/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
