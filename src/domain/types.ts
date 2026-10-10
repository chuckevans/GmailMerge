/** Canonical domain vocabulary. Follow SPEC v3.1 and PROJECT_MANIFEST.md. */
export type PipelineStage = "INITIAL" | "FOLLOWUP_1" | "FOLLOWUP_2" | "FOLLOWUP_3";
export type PipelineStatus = "ACTIVE" | "WAITING" | "RESPONDED" | "ENGAGED" | "COMPLETED" | "PAUSED" | "CLOSED" | "SUPPRESSED";
export type MessageStatus = "DRAFT" | "READY" | "HOLD" | "DUPLICATE" | "QUEUED" | "SENDING" | "SENT" | "FAILED" | "REVIEW_REQUIRED" | "DELETED" | "SUPPRESSED";
export type ResponseStatus = "NONE" | "REPLIED" | "AUTO_REPLY" | "BOUNCED" | "OPTED_OUT";
export type JobStatus = "PENDING" | "CLAIMED" | "SUCCEEDED" | "FAILED" | "UNCERTAIN" | "CANCELED";
export interface Contact { contactId: string; email: string; normalizedEmail: string; firm?: string; techField?: string; }
export interface OutreachMessage { messageId: string; membershipId: string; sequenceStep: number; subject: string; body: string; status: MessageStatus; sentAt?: string; gmailMessageId?: string; gmailThreadId?: string; }
