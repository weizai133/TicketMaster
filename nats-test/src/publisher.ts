import nats from "node-nats-streaming";
import { TicketCreatePublisher } from "./events/ticket-created-publisher";

console.clear();

const stan = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222'
})

stan.on('connect', async () => {
  console.log('Publisher connected to NATS')
  const payload = {
    id: "123",
    title: 'concert',
    price: 20
  }

  const publisher = new TicketCreatePublisher(stan);
  try {
    await publisher.publish(payload);  
  } catch (error) {
    console.log(error); 
  }
});