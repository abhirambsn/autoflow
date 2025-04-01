import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import { webhookRouter } from './routes';

const app = express();

app.use(express.json());
app.use(cors());


app.use('/api/v1/webhook', webhookRouter);

app.get('/', (_, res) => {
    res.status(200).json({message: "ok"});
    return;
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Webhook service running on port ${PORT}`);
});