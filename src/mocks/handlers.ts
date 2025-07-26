import { HttpResponse, http } from 'msw';
import { db } from './db';

const randomResponses = [
  "Interesante, dime más",
  "¡Vaya! No lo sabía",
  "Estoy procesando eso...",
  "¿Has probado reiniciando?",
  "🤖 *sonidos de robot*"
];

export const handlers = [
  http.get('http://localhost:3000/api/messages', () => {
    const messages = db.message.getAll();
    return HttpResponse.json(messages);
  }),

  http.post('http://localhost:3000/api/messages', async ({ request }) => {
    const { text } = (await request.json()) as { text: string };
    
    db.message.create({
      id: Date.now().toString(),
      text,
      sender: 'user',
      createdAt: Date.now(),
    });

    const botResponse = randomResponses[Math.floor(Math.random() * randomResponses.length)];
    
    db.message.create({
      id: (Date.now() + 1).toString(),
      text: botResponse,
      sender: 'bot',
      createdAt: Date.now(),
    });

    return HttpResponse.json({ success: true });
  }),
];