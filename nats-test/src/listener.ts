import nats from "node-nats-streaming";
import { randomBytes } from "crypto";
import { TicketCreateListener } from "./events/ticket-create-listener";

console.clear();

const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), { url: 'http://localhost:4222' });

stan.on('connect', () => {
  console.log('Listener connected to NATS');

  stan.on('close', () => { console.log('Listener is closed'); process.exit()});

  new TicketCreateListener(stan).listen();
})