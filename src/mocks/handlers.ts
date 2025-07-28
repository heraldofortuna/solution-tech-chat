import { HttpResponse, http } from 'msw';
import { db } from './db';
import { BusinessTopic } from '@/types/topic';
import timestampToHHMM from "@/utils/timestampToHHMM";
import { ChatFile } from '@/types/chatfile';

const businessResponses: Record<BusinessTopic, string> = {
  organigrama: "Nuestro organigrama se compone de:\n\n- Dirección General\n- Departamento de Desarrollo\n- Área Comercial\n- Equipo de Soporte\n\n¿Necesitas información sobre algún área en particular?",
  misión: "Nuestra misión es proporcionar soluciones tecnológicas innovadoras que impulsen el crecimiento de nuestros clientes mediante herramientas digitales de vanguardia.",
  visión: "Ser líderes en desarrollo de software personalizado en Latinoamérica para 2025, reconocidos por nuestra excelencia técnica y enfoque centrado en el cliente.",
  proyectos: "Actualmente trabajamos en:\n\n1. Plataforma de gestión educativa\n2. Sistema de automatización logística\n3. App móvil para comercio local\n\n¿Te interesa conocer más sobre alguno?",
  servicios: "Ofrecemos:\n\n- Desarrollo web y móvil\n- Consultoría TI\n- Integración de sistemas\n- Inteligencia de negocios\n\n¿Qué servicio te interesa?",
  contacto: "Puedes contactarnos a:\n\n- Email: info@solutiontech.com\n- Teléfono: +51 123 456 789\n- Oficina: Av. Tecnológica 123, Lima",
  default: "Entendido. ¿Podrías especificar si tu consulta es sobre: organigrama, misión, visión, proyectos, servicios o contacto?"
};

const detectTopic = (text: string): string => {
  const topics = Object.keys(businessResponses);
  const normalizedText = text.toLowerCase();
  
  for (const topic of topics) {
    if (normalizedText.includes(topic)) {
      return topic;
    }
  }
  
  if (/organigrama|estructura|equipo|departamentos/i.test(normalizedText)) return 'organigrama';
  if (/misión|mision|propósito|proposito|razón de ser|razon de ser/i.test(normalizedText)) return 'misión';
  if (/visión|vision|futuro|objetivo a largo plazo/i.test(normalizedText)) return 'visión';
  if (/proyecto|iniciativa|desarrollo actual/i.test(normalizedText)) return 'proyectos';
  if (/servicio|producto|que ofrecen/i.test(normalizedText)) return 'servicios';
  if (/contacto|ubicación|ubicacion|teléfono|telefono|email/i.test(normalizedText)) return 'contacto';
  
  return 'default';
};

export const handlers = [
  // Obtener todas las sesiones de chat
  http.get('http://localhost:3000/api/chat-sessions', () => {
    const sessions = db.chatSession.getAll();
    return HttpResponse.json(sessions);
  }),
  // Crear nueva sesión
  http.post('http://localhost:3000/api/chat-sessions', async () => {
    const newSession = db.chatSession.create({
      id: `session_${Date.now()}`,
      title: `Conversación ${new Date().toLocaleDateString()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      preview: 'Nueva conversación iniciada'
    });
    return HttpResponse.json(newSession);
  }),
  // Obtener mensajes de una sesión específica
  http.get('http://localhost:3000/api/chat-sessions/:chatId/messages', ({ params }) => {
    const messages = db.message.findMany({
      where: {
        chatId: { equals: params.chatId as string }
      },
      orderBy: { createdAt: 'asc' }
    });
    return HttpResponse.json(messages);
  }),
  // Obtener todos los mensajes que coincidan con una búsqueda
  http.get('/api/search-messages', async ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q')?.toLowerCase() || '';
    const allSessions = db.chatSession.getAll();

    const results = allSessions.flatMap(session => {
      const sessionMessages = db.message.findMany({
        where: {
          chatId: { equals: session.id }
        }
      });
      
      return sessionMessages
        .filter(message => message.text?.toLowerCase().includes(query))
        .map(message => ({
          sessionId: session.id,
          sessionTitle: session.title,
          ...message
        }));
    });

    return HttpResponse.json(results);
  }),
  // Guardar mensajes de una sesión específica
  http.post('/api/chat-sessions/:chatId/messages', async ({ request, params }) => {
    const { chatId } = params;
    const formData = await request.formData();
    const text = formData.get('text') as string;
    
    const files: Array<{
      name: string;
      type: string;
      path: string;
      size: string;
      url?: string;
    }> = [];
    
    let index = 0;
    while (formData.has(`file_${index}`)) {
      const file = formData.get(`file_${index}`) as File;
      const fileId = `file_${Date.now()}_${index}`;
      const filePath = `/uploads/${fileId}_${file.name}`;

      files.push({
        name: file.name,
        type: file.type,
        path: filePath,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        url: URL.createObjectURL(file),
      });
      index++;
    }

    const hasFiles = files.length > 0;
    const hasText = text?.trim().length > 0;

    if (!hasText && !hasFiles) {
      return HttpResponse.json(
        { error: "No se recibió contenido" },
        { status: 400 }
      );
    }

    const userMessage = db.message.create({
      id: `msg_${Date.now()}`,
      chatId: chatId as string,
      text: hasText ? text : files.length > 1 ? "Archivos enviados" : "Archivo enviado",
      sender: 'user',
      createdAt: timestampToHHMM(Date.now()),
      files: hasFiles ? files : undefined
    });

    let botResponseText: string;
    
    if (hasFiles) {
      const fileResponses = [
        "Documento recibido. ¿Necesitas que analice algo en particular?",
        "Archivo procesado. ¿Qué información necesitas sobre este material?",
        "He revisado el contenido. ¿En qué puedo ayudarte con este archivo?"
      ];
      botResponseText = fileResponses[Math.floor(Math.random() * fileResponses.length)];
    } else {
      const topic = detectTopic(text);
      botResponseText = businessResponses[topic as BusinessTopic] || businessResponses.default;
    }

    const botResponse = db.message.create({
      id: `msg_${Date.now() + 1}`,
      chatId: chatId as string,
      text: botResponseText,
      sender: 'bot',
      createdAt: timestampToHHMM(Date.now())
    });

    const session = db.chatSession.update({
      where: { id: { equals: chatId as string } },
      data: {
        updatedAt: Date.now(),
        preview: hasText 
          ? text.length > 30 ? `${text.substring(0, 30)}...` : text
          : `${files.length} archivo${files.length > 1 ? 's' : ''} enviado${files.length > 1 ? 's' : ''}`
      }
    });

    return HttpResponse.json({
      success: true,
      messages: [userMessage, botResponse],
      session
    });
  })
];