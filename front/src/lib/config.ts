// Configuração central do studio — altere o número do WhatsApp apenas aqui.
// integrar com o back aq
export const STUDIO_NAME = "Studio Bella";
export const WHATSAPP_NUMBER = "5511999999999";

export const whatsappLink = (message: string, phone: string = WHATSAPP_NUMBER) =>
  `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

export const bookingMessage = (serviceName?: string) =>
  serviceName
    ? `Olá! Gostaria de agendar ${serviceName}.`
    : `Olá! Gostaria de agendar um horário no ${STUDIO_NAME}. 💕`;
