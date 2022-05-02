import * as React from 'react';
import { useState, useEffect } from 'react';
import useInterval from 'use-interval';
import { getTokens, login, logout } from './authenticate';
import Chat from './Chat';
import LoginHeader from './LoginHeader';
import MaskSettings from './MaskSettings';
import { fetchMasks, fetchMessages, postMessage, postMasks } from './api';
import { Mask, Message } from './types';

const FETCH_INTERVAL = 2000;

const App = () => {
  const [accessToken, setAccessToken] = useState<string>(null);
  const [idClaims, setIdClaims] = useState(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [masks, setMasks] = useState<Mask[]>([]);

  useEffect(() => {
    async function callGetTokens() {
      const { accessToken, idClaims } = await getTokens();
      if (accessToken) setAccessToken(accessToken);
      if (idClaims) setIdClaims(idClaims);
    }
    if (!accessToken || !idClaims) callGetTokens();
  });

  useInterval(() => {
    async function callFetchMessages() {
      const messages = await fetchMessages(accessToken);
      setMessages(messages);
    }

    if (accessToken) callFetchMessages();
  }, FETCH_INTERVAL, true);

  async function callFetchMasks() {
    const masks = await fetchMasks(accessToken);
    setMasks(masks);
  }

  useEffect(() => {
    if (accessToken) callFetchMasks();
  }, [accessToken]);


  return (
    <div className='app'>
      <LoginHeader
        name={idClaims?.name}
        loginHandler={login}
        logoutHandler={logout}
      />
      <Chat 
        disabled={!accessToken}
        messages={messages}
        sendMessageHandler={
          (message) => {
            const { name, oid } = idClaims;
            postMessage({
              sender: {
                displayName: name,
                id: oid
              },
              body: message
            }, accessToken);
          }}
        />
      <MaskSettings
        masks={masks}
        updateMasksHandler={async (masks) => {
          const newMasks = await postMasks(masks, accessToken);
          setMasks(newMasks);
        }}
      />
      </div>
  )
};

export default App;
