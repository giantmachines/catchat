import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';

require('dotenv').config();

interface User {
  id: string;
  displayName: string;
}

interface Message {
  timestamp?: number;
  sender: User;
  body: string;
}

const messages: Message[] = [];
let masks: string[] = [];

const port = 3000;
const app = express();

app.use(bodyParser.text());
app.use(cors());

const meowMask = (message: Message) => {
    if (!masks.length || !message.body.length) return message;
    let maskPattern= masks.join('|');
    let maskRe = new RegExp(maskPattern, 'g');
    return { ...message, body: message.body.replace(maskRe, 'meow') };
}

app.get('/messages', (req, res) => {
  const maskedMessages = messages.map(meowMask);
  res.json(maskedMessages);
});

app.post('/messages', (req, res) => {
  const body = req.body;
  const message = JSON.parse(body);
  message.timestamp = Date.now();
  messages.push(message);
  res.status(200);
});

app.get('/masks', (req, res) => {
  res.json(masks);
});

app.post('/masks', (req, res) => {
  const body = req.body;
  masks = JSON.parse(body);
  res.json(masks);
});
 
app.listen(port, () => {
  console.log(`Chat server listening on port ${port}.`);
});
