import nats from "node-nats-streaming";
import { randomBytes } from "crypto";
import { TicketCreateListener } from "./events/ticket-create-listener";

console.clear();

// abstract class Listener {
//   abstract subject: string;
//   abstract queueGroupName: string;
//   abstract onMessage(data: any, msg: Message): void
//   private client: Stan;
//   protected ackWait = 5 * 1000;

//   constructor (client: Stan) {
//     this.client = client;
//   }

//   subscriptionOptions() {
//     return this.client
//         .subscriptionOptions()
//         .setDeliverAllAvailable()
//         .setManualAckMode(true)
//         .setAckWait(this.ackWait)
//         .setDurableName(this.queueGroupName);
//   }

//   parseData(payload: Message) {
//     const data = payload.getData();
//     return typeof data === 'string' ? JSON.parse(data) : JSON.parse(data.toString('utf8'));
//   }

//   listen() {
//     const subscription = this.client.subscribe(
//       this.subject,
//       this.queueGroupName,
//       this.subscriptionOptions()
//     )

//     subscription.on('message', (msg: Message) => {
//       console.log(`Message received ${this.subject} / ${this.queueGroupName}`);

//       const parsedData = this.parseData(msg);
//       this.onMessage(parsedData, msg);
//     })
//   }
// }

// class TicketCreatedListener extends Listener {
//   subject = 'ticket:created';
//   queueGroupName = 'payment-service';

//   onMessage(data: any, msg: Message) {
//     console.log('Event DATA:', data);

//     msg.ack();
//   }
// }

const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), { url: 'http://localhost:4222' });

stan.on('connect', () => {
  console.log('Listener connected to NATS');

  stan.on('close', () => { console.log('Listener is closed'); process.exit()});

  new TicketCreateListener(stan).listen();
})