import * as React from 'react';

interface ChatInputProps {
  label: string;
  sendMessageHandler: (message: string) => void;
  disabled?: boolean | null;
}

const ChatInput = ({ disabled, label, sendMessageHandler }: ChatInputProps) => {
  return (
    <form className="chat-input" onSubmit={(e) => {
      e.preventDefault();
      const message = (e.target as HTMLFormElement).message;
      sendMessageHandler(message.value);
      message.value = '';
      
    }}>
      <input 
        disabled={disabled}
        type="text" 
        name="message" 
        autoComplete="off"
        placeholder={label}>
      </input>
    </form>
  );

}

export default ChatInput;
