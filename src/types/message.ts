import { ChatFile } from "./chatfile";
import { Sender } from "./sender";

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  time: string;
  files?: ChatFile[];
}