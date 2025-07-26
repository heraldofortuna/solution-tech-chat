import { factory, primaryKey } from '@mswjs/data';

export const db = factory({
  chatSession: {
    id: primaryKey(String),
    title: String,
    createdAt: Number,
    updatedAt: Number,
    preview: String
  },
  message: {
    id: primaryKey(String),
    chatId: String,
    text: String,
    sender: String,
    createdAt: String,
    files: Array,
  },
});

db.chatSession.create({
  id: 'default',
  title: 'Conversación Principal',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  preview: '¡Hola! Soy SolutionTech. ¿En qué puedo ayudarte?'
});