import * as React from 'react';
import { useState, useEffect } from 'react';
import useInterval from 'use-interval';
import Chat from './Chat';
import LoginHeader from './LoginHeader';
import MaskSettings from './MaskSettings';
import { fetchMasks, fetchMessages, postMessage, postMasks } from './api';
import { Mask, Message } from './types';

const FETCH_INTERVAL = 2000;

const user = {
  displayName: `Guest${Math.floor(Math.random() *1000)}`,
  id: `${Date.now()}`
};

const App = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [masks, setMasks] = useState<Mask[]>([]);

  useInterval(() => {
    async function callFetchMessages() {
      const messages = await fetchMessages();
      setMessages(messages);
    }

    callFetchMessages();
  }, FETCH_INTERVAL, true);

  async function callFetchMasks() {
    const masks = await fetchMasks();
    setMasks(masks);
  }

  useEffect(() => {
    callFetchMasks();
  }, []);


  return (
    <div className='app'>
      <h1>CAT CHAT</h1>
      <Chat 
        messages={messages}
        sendMessageHandler={
          (message) => {
            const { displayName, id } = user;
            postMessage({
              sender: {
                displayName,
                id
              },
              body: message
            });
          }}
        />
      <MaskSettings
        masks={masks}
        updateMasksHandler={async (masks) => {
          const newMasks = await postMasks(masks);
          setMasks(newMasks);
        }}
      />
      </div>
  )
};

export default App;
