import { settingsStore } from "./studio-store";

// All public booking links continue to be generated centrally here.
export const whatsappLink = (message: string, phone?: string) => {
  const digits = (phone ?? settingsStore.get().whatsapp).replace(/\D/g, "");
  return /^\d{10,15}$/.test(digits) ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : undefined;
};
export const bookingMessage = (serviceName?: string) => serviceName
  ? `Olá, gostaria de agendar ${serviceName}.`
  : `Olá! Gostaria de agendar um horário no ${settingsStore.get().studioName}. 💕`;
