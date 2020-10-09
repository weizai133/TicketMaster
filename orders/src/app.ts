import express from 'express';
import 'express-async-errors';
import morgan from "morgan";
import { json } from 'body-parser';
import { errorHandler, NotFoundError } from '@rayjson/common';
import orderRouter from "./routes/main";

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

app.use('/api/orders', orderRouter);

app.all('*', async (req, res) => {
  console.log('here')
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
