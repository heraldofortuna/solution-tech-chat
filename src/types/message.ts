import { ChatFile } from "./chatfile";
import { Sender } from "./sender";

export interface Message {
  id: string;
  chatId: string;
  text: string;
  sender: Sender;
  createdAt: string;
  files?: ChatFile[];
}