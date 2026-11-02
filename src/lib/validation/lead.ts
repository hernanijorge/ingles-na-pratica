import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome."),
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  whatsapp: z.string().trim().min(8, "Informe um WhatsApp válido."),
});

export type LeadInput = z.infer<typeof leadSchema>;
