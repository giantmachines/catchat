export interface User {
  displayName: string;
  id: string;
}

export interface Message {
  sender: User;
  body: string;
  time?: number;
}

export type Mask = string;
