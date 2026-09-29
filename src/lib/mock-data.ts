import nailGallery from "@/assets/nail-gallery.jpg";
import studioHero from "@/assets/studio-hero.jpg";
import professional from "@/assets/professional.jpg";
// integrar com o back aq
export type Service = { id: string; name: string; short: string; description: string; price: number; duration: string; icon: string; image: string; active: boolean };
export type AppointmentStatus = "Pendente" | "Confirmado" | "Atendido" | "Não atendido" | "Cancelado";
export const appointmentStatuses: AppointmentStatus[] = ["Pendente", "Confirmado", "Atendido", "Não atendido", "Cancelado"];
export type Appointment = { id: number; day: number; time: string; client: string; service: string; value: number; status: AppointmentStatus; phone: string };
export type Client = { id: number; name: string; phone: string; birthday: string; firstVisit: string; lastVisit: string; visits: number; spent: number; inactiveDays?: number };

// integrar com o back aq
export const services: Service[] = [
  { id: "manicure", name: "Manicure", short: "Cuidado essencial", description: "Cutilagem delicada, preparação e esmaltação impecável.", price: 30, duration: "40 min", icon: "Sparkles", image: nailGallery, active: true },
  { id: "pedicure", name: "Pedicure", short: "Leveza e cuidado", description: "Tratamento completo para pés bonitos e bem cuidados.", price: 35, duration: "50 min", icon: "Footprints", image: studioHero, active: true },
  { id: "combo", name: "Manicure + Pedicure", short: "Experiência completa", description: "O ritual completo de cuidado para mãos e pés.", price: 60, duration: "1h30", icon: "Heart", image: professional, active: true },
  { id: "gel", name: "Esmaltação em gel", short: "Brilho prolongado", description: "Acabamento resistente, brilho intenso e longa duração.", price: 70, duration: "1h20", icon: "Gem", image: nailGallery, active: true },
];

// integrar com o back aq
export const appointments: Appointment[] = [
  { id: 1, day: 29, time: "09:00", client: "Maria Silva", service: "Manicure", value: 30, status: "Confirmado", phone: "5511999990001" },
  { id: 2, day: 29, time: "14:00", client: "Ana Souza", service: "Pedicure", value: 35, status: "Pendente", phone: "5511999990002" },
  { id: 3, day: 29, time: "16:30", client: "Juliana Santos", service: "Manicure + Pedicure", value: 60, status: "Confirmado", phone: "5511999990003" },
  { id: 4, day: 30, time: "10:00", client: "Beatriz Lima", service: "Esmaltação em gel", value: 70, status: "Atendido", phone: "5511999990004" },
  { id: 6, day: 29, time: "11:00", client: "Beatriz Lima", service: "Esmaltação em gel", value: 70, status: "Não atendido", phone: "5511999990004" },
  { id: 5, day: 2, time: "13:30", client: "Carolina Dias", service: "Manicure", value: 30, status: "Confirmado", phone: "5511999990005" },
];

// integrar com o back aq
export const clients: Client[] = [
  { id: 1, name: "Maria Silva", phone: "(11) 99999-0001", birthday: "14/05", firstVisit: "12/02/2026", lastVisit: "20/09/2026", visits: 12, spent: 620 },
  { id: 2, name: "Ana Souza", phone: "(11) 99999-0002", birthday: "03/11", firstVisit: "20/03/2026", lastVisit: "15/08/2026", visits: 8, spent: 430, inactiveDays: 45 },
  { id: 3, name: "Juliana Santos", phone: "(11) 99999-0003", birthday: "28/01", firstVisit: "08/01/2026", lastVisit: "07/08/2026", visits: 15, spent: 890, inactiveDays: 52 },
  { id: 4, name: "Beatriz Lima", phone: "(11) 99999-0004", birthday: "19/08", firstVisit: "16/04/2026", lastVisit: "30/09/2026", visits: 6, spent: 390 },
  { id: 5, name: "Carolina Dias", phone: "(11) 99999-0005", birthday: "07/06", firstVisit: "22/02/2026", lastVisit: "24/07/2026", visits: 5, spent: 280, inactiveDays: 67 },
];

export const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
