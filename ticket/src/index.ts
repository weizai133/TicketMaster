import express, { Request, Response } from "express";
import 'express-async-errors';
import mongoose from "mongoose";
import { json } from "body-parser";
import { errorHandler, NotFoundError } from "@rayjson/common";
import morgan from "morgan";
import { natsWrapper } from "./nats-wrapper";
import { OrderCreatedListener } from "./events/listener/OrderCreatedListener";
import { OrderCancelledListener } from "./events/listener/OrderCancelledListener";
import ticketRouter from "./routes";

const app = express();
app.use(json());

app.use(morgan(function (tokens, req, res) {
  return [
    'Request:', tokens.method(req, res),
    tokens.url(req, res),
    'status:', tokens.status(req, res),
    'requestBody:', JSON.stringify(req.body),
    tokens['response-time'](req, res), 'ms'
  ].join(' ');
}));

app.get('/checkStatus', (req: Request, res: Response) => {
  res.status(200).json({ success: true });
});

app.use('/api/tickets', ticketRouter);

app.use('*', async (req: Request, res: Response) => {
  throw new NotFoundError()
});

app.use(errorHandler);

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT token must be defined')
  }
  if (!process.env.MONGO_URI) {
    throw new Error('Mongo URI must be defined')
  }
  if (!process.env.NATS_CLIENT_URL) {
    throw new Error('NATS_CLIENT_URL must be defined')
  }
  if (!process.env.CLUSTER_IP) {
    throw new Error('CLUSTER_IP must be defined')
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL must be defined')
  }

  try {
    await natsWrapper.connect(process.env.CLUSTER_IP, process.env.NATS_CLIENT_URL, process.env.NATS_URL);
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed!');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());
    
    new OrderCreatedListener(natsWrapper.client).listen();
    new OrderCancelledListener(natsWrapper.client).listen();
    
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.log(error)
  }
  app.listen(3000, () => {
    console.log('TICKET service is listening on PORT 3000');
  });
}

start();