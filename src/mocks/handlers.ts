import { HttpResponse, http } from 'msw';
import { db } from './db';
import { BusinessTopic } from '@/types/topic';

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
  http.get('http://localhost:3000/api/messages', () => {
    const messages = db.message.getAll();
    return HttpResponse.json(messages);
  }),

  http.post('http://localhost:3000/api/messages', async ({ request }) => {
    const formData = await request.formData();
    const text = formData.get('text') as string;
    
    // Procesamiento de archivos (mantén tu lógica actual)
    const files: Array<{ name: string; type: string, image: string, size: string }> = [];
    let index = 0;

    while (formData.has(`file_${index}`)) {
      const file = formData.get(`file_${index}`) as File;
      files.push({
        name: file.name,
        type: file.type,
        image: URL.createObjectURL(file),
        size: `${(file.size / 1024).toFixed(1)} KB`,
      });
      index++;
    }

    const hasFiles = files.length > 0;
    const hasText = text.trim().length > 0;

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

    // Respuesta inteligente
    let botResponseText: string;
    
    if (hasFiles) {
      // Mantén tus respuestas para archivos
      const fileResponses = [
        "Documento recibido. ¿Necesitas que analice algo en particular?",
        "Archivo procesado. ¿Qué información necesitas sobre este material?",
        "He revisado el contenido. ¿En qué puedo ayudarte con este archivo?"
      ];
      botResponseText = fileResponses[Math.floor(Math.random() * fileResponses.length)];
    } else {
      // Respuesta basada en el tema detectado
      const topic = detectTopic(text);
      botResponseText = businessResponses[topic as BusinessTopic] || businessResponses.default;
    }

    const botResponse = db.message.create({
      id: (Date.now() + 1).toString(),
      text: botResponseText,
      sender: 'bot',
      createdAt: Date.now(),
    });

    return HttpResponse.json({
      success: true,
      messages: [userMessage, botResponse],
    });
  })
];