const SERVER_URI = process.env.SERVER_URI;
import { Mask, Message } from './types';

export async function postMessage(message: Message) {
  const resp = await fetch(`${SERVER_URI}/messages`, 
    { 
      method: 'POST', 
      body: JSON.stringify(message),
    });
  const json = await resp.json();
  return json;
}

export async function fetchMessages() {
  const resp = await fetch(`${SERVER_URI}/messages`);
  const json = await resp.json();
  return json;
}

export async function fetchMasks() {
  const resp = await fetch(`${SERVER_URI}/masks`);
  const json = await resp.json();
  return json;
}

export async function postMasks(masks: Mask[]) {
  const resp = await fetch(`${SERVER_URI}/masks`, 
    { 
      method: 'POST', 
      body: JSON.stringify(masks),
    });
  const json = await resp.json();
  return json;
}
