import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { Request, Response, NextFunction } from 'express';
import { decode, JwtPayload } from 'jsonwebtoken';

require('dotenv').config();

const CLIENT_APP_ID = process.env.CLIENT_APP_ID;
const AUDIENCE = process.env.AUDIENCE;

interface User {
  id: string;
  displayName: string;
  role: 'admin' | 'user';
}

interface Message {
  timestamp?: number;
  sender: User;
  body: string;
}

const accessTokenValidator = function(req: Request, res: Response, next: NextFunction) {
  const accessToken = req.headers.authorization.split(' ')[1];
  const claims = parseClaims(accessToken);
  if (claims?.aud === AUDIENCE && claims?.appid === CLIENT_APP_ID) {
    next();
  } else {
    res.status(401).end();
  }
}

const messages: Message[] = [];
let masks: string[] = [];

const port = 3000;
const app = express();

app.use(bodyParser.text());
app.use(cors());
app.use(accessTokenValidator);


const isValidToken = (token: JwtPayload | string) => true;

const parseClaims = (token: string): JwtPayload | null => {
  const decoded = decode(token);
  if (!isValidToken(decoded)) return null;
  return (decoded as JwtPayload);
}

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
  const idToken = req.header('id-token');
  const claims = parseClaims(idToken);
  if (isAdmin(parseClaims(idToken))) {
    const body = req.body;
    masks = JSON.parse(body);
    res.json(masks);
  } else {
    res.status(403);
  }
});

const isAdmin = (idToken: JwtPayload) => (
  idToken?.roles
  && (idToken.roles as Array<string>)
    .includes('Chat.Admin'));
  
app.listen(port, () => {
  console.log(`Chat server listening on port ${port}.`);
});
