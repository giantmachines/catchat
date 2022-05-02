import * as React from 'react';
import { Message } from './types';

interface ChatMessageBoxProps {
  messages: Message[];
}

const ChatMessageBox = ({ messages }: ChatMessageBoxProps) => {
  return (
    <div className='chat-message-box'>
      { messages.reverse().map(message => 
      <div className='chat-message'>
        <span className="chat-message-sender-name">{message.sender.displayName}</span>
        <span className="chat-message-body">{message.body}</span></div>
      )}
    </div>
  );

}

export default ChatMessageBox;
