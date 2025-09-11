import { ChatMessage } from '../provider';

const EMERGENCY = `If this is an emergency, call your nearest 24/7 veterinary hospital.
For Seattle (98101), consider:
- Downtown Animal Hospital (206) 555-0123
- Emergency Vet Seattle (206) 555-9000

Keep your pet warm, limit movement, and bring medical records if available.`;

const EXOTICS = `For exotic pets, look for clinics that explicitly list 'Exotics' or 'Avian/Reptile'.
In Bellevue (98004), Bellevue Veterinary Clinic is known for exotics care.
Call ahead to confirm species.`;

const GENERIC = `I can help you refine your search.
Try adding a ZIP (e.g., 98101) or type 'vet'/'shelter'.
You can also filter by services like 'Emergency' or 'Dental'.`;

export function pickResponse(messages: ChatMessage[]): string {
  const last = messages?.[messages.length - 1];
  const text = (last?.content || '').toLowerCase();
  if (text.includes('emergency')) return EMERGENCY;
  if (text.includes('exotics')) return EXOTICS;
  return GENERIC;
}

