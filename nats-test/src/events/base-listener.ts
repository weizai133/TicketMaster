import { Message, Stan } from "node-nats-streaming";
import { Subjects } from "./Subjects";

interface Event {
  subject: Subjects;
  data: any
}

export abstract class Listener<T extends Event> {
  private client: Stan;
  abstract queueGroupName: string;
  abstract subject: T["subject"];
  abstract onMessage(data: T["data"], msg: Message): void;
  protected ackWait = 5 * 1000;


  constructor (client: Stan) {
    this.client = client;
  }

  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable()
      .setManualAckMode(true)
      .setAckWait(this.ackWait)
      .setDurableName(this.queueGroupName)
  }

  parseData(payload: Message) {
    const data = payload.getData();
    return typeof data === 'string' ? JSON.parse(data) : JSON.parse(data.toString('utf8'));
  }

  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    );

    subscription.on('message', (msg: Message) => {
      console.log(`Message received ${this.subject} / ${this.queueGroupName}`);

      const parsedData = this.parseData(msg);
      this.onMessage(parsedData, msg);
    })
  }
}