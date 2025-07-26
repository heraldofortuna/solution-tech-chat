import { Sender } from "./sender";

export interface MessageResponse {
  id: string;
  text: string;
  sender: Sender;
  createdAt: number;
  chatId: string;
}

