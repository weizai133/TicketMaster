import express, { Request, Response } from "express";
import "express-async-errors";
import morgan from "morgan";
import { json } from "body-parser";
import mongoose from "mongoose";
import authRouter from "./routes/auth";
import { NotFoundError, errorHandler } from "@rayjson/common";

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

app.use('/api/users', authRouter);

app.use('*', (req: Request, res: Response) => {
  throw new NotFoundError()
});

app.use(errorHandler);

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT token must be defined')
  }
  try {
    await mongoose.connect("mongodb://auth-mongo-srv:27017/auth", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.log(error)
  }
  app.listen(3000, () => {
    console.log('AUTH service is listening on PORT 3000');
  });
}

start();

