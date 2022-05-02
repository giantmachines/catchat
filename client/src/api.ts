const SERVER_URI = process.env.SERVER_URI;
import { Mask, Message } from './types';

export async function postMessage(message: Message, token: string) {
  const resp = await fetch(`${SERVER_URI}/messages`, 
    { 
      method: 'POST', 
      body: JSON.stringify(message),
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  const json = await resp.json();
  return json;
}

export async function fetchMessages(token: string) {
  const resp = await fetch(`${SERVER_URI}/messages`, 
    { 
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  const json = await resp.json();
  return json;
}

export async function fetchMasks(token: string) {
  const resp = await fetch(`${SERVER_URI}/masks`, 
    { 
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  const json = await resp.json();
  return json;
}

export async function postMasks(masks: Mask[], accessToken: string, idToken: string) {
  const resp = await fetch(`${SERVER_URI}/masks`, 
    { 
      method: 'POST', 
      body: JSON.stringify(masks),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'id-token': idToken,
      }
    });
  const json = await resp.json();
  return json;
}
