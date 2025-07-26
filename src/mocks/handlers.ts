import { HttpResponse, http } from 'msw';
import { db } from './db';

const randomResponses = [
  "Interesante, dime más",
  "¡Vaya! No lo sabía",
  "Estoy procesando eso...",
  "¿Has probado reiniciando?",
  "🤖 *sonidos de robot*",
  "Archivo recibido, gracias",
  "Voy a revisar este material",
  "¿Necesitas algo más sobre este archivo?",
  "Documento analizado correctamente",
  "Imagen procesada con éxito"
];

const getRandomResponse = (hasFiles: boolean) => {
  if (hasFiles) {
    const fileResponses = [
      "Archivo recibido, gracias",
      "Voy a revisar este material",
      "Documento analizado correctamente",
      "Imagen procesada con éxito",
      "¿Necesitas algo más sobre este archivo?"
    ];
    return fileResponses[Math.floor(Math.random() * fileResponses.length)];
  }
  return randomResponses[Math.floor(Math.random() * randomResponses.length)];
};

export const handlers = [
  http.get('http://localhost:3000/api/messages', () => {
    const messages = db.message.getAll();
    return HttpResponse.json(messages);
  }),

  http.post('http://localhost:3000/api/messages', async ({ request }) => {
    const formData = await request.formData();
    const text = formData.get('text') as string;
    
    // Procesar archivos
    const files: Array<{ name: string; type: string }> = [];
    let index = 0;
    console.log("files:", files);
    while (formData.has(`file_${index}`)) {
      const file = formData.get(`file_${index}`) as File;

      files.push({
        name: file.name,
        type: file.type,
      });
      index++;
    }

    const hasFiles = files.length > 0;
    const hasText = text.trim().length > 0;

    // Validación mínima
    if (!hasText && !hasFiles) {
      return HttpResponse.json(
        { error: "No se recibió contenido" },
        { status: 400 }
      );
    }

    // Guardar mensaje del usuario
    const userMessage = db.message.create({
      id: Date.now().toString(),
      text: hasText ? text : files.length > 1 ? "Archivos enviados" : "Archivo enviado",
      sender: 'user',
      createdAt: Date.now(),
      files: hasFiles ? files : undefined,
    });

    // Generar respuesta contextual del bot
    const botResponseText = getRandomResponse(hasFiles);
    
    const botResponse = db.message.create({
      id: (Date.now() + 1).toString(),
      text: botResponseText,
      sender: 'bot',
      createdAt: Date.now(),
      // Opcional: el bot puede "devolver" archivos procesados
      ...(hasFiles && files[0].type.startsWith('image/') && {
        files: [{
          name: `processed_${files[0].name}`,
          type: files[0].type,
        }]
      })
    });

    return HttpResponse.json({
      success: true,
      messages: [userMessage, botResponse],
    });
  }),
];