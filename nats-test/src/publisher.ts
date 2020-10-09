import nats from "node-nats-streaming";
import { TicketCreatePublisher } from "./events/ticket-created-publisher";
import { TicketUpdatePublisher } from "./events/ticket-updated-publisher";

console.clear();

const stan = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222'
})

stan.on('connect', async () => {
  console.log('Publisher connected to NATS')
  const payload = {
    id: "5f7f0eac7f210f0018e2734b",
    title: 'Purpose Tour Cannada',
    price: 20,
    version: 4
  }

  /**
   * @Create Event
   */
  // const publisher = new TicketCreatePublisher(stan);
  /**
   * @Update Event
   */
  const publisher = new TicketUpdatePublisher(stan);
  try {
    await publisher.publish(payload);  
  } catch (error) {
    console.log(error); 
  }


});