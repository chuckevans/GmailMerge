import type { Contact, OutreachMessage } from "@/domain/types";
/** Interface only. Sheets adapter is intentionally NOT implemented yet. */
export interface OutreachRepository {
  findContactByNormalizedEmail(email: string): Promise<Contact | null>;
  saveContact(contact: Contact): Promise<void>;
  findMessage(id: string): Promise<OutreachMessage | null>;
  saveMessage(message: OutreachMessage): Promise<void>;
}
