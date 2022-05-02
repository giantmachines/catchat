import * as React from 'react';
import ChatMessageBox from './ChatMessageBox'; 
import ChatInput from './ChatInput';
import { Message } from './types';

interface ChatProps {
  disabled?: boolean | null;
  messages: Message[];
  sendMessageHandler: (message: string) => void;
}

const Chat = ({ disabled, messages, sendMessageHandler }: ChatProps) => {
  return (
    <div className="chat">
      <ChatMessageBox messages={messages} />
      <ChatInput 
        disabled={disabled}
        label="Meow your message here" 
        sendMessageHandler={sendMessageHandler} 
      />
    </div>
)};

export default Chat;
