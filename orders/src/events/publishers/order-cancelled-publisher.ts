import { Subjects, Publisher, OrderCancelledEvent } from '@rayjson/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
