import { factory, primaryKey } from '@mswjs/data';

export const db = factory({
  message: {
    id: primaryKey(String),
    text: String,
    sender: String, // 'user' o 'bot'
    createdAt: Number,
  },
});

// Mensaje inicial del bot
db.message.create({
  id: '1',
  text: '¡Hola! Soy SolutionTech. ¿En qué puedo ayudarte?',
  sender: 'bot',
  createdAt: Date.now(),
});