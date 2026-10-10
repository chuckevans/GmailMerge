/** Interface only: direct Gmail API adapter will be implemented in Phase 1. */
export interface GmailSendResult { gmailMessageId: string; gmailThreadId: string; rfcMessageId?: string; }
export interface GmailTransport {
  verifySender(address: string): Promise<boolean>;
  send(input: { to: string; subject: string; body: string; threadId?: string; inReplyTo?: string; references?: string }): Promise<GmailSendResult>;
}
