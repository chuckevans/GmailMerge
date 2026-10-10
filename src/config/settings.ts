import { z } from "zod";
/** Environment defaults; project/campaign overrides will be added in Phase 5. */
export const sendingConfigSchema = z.object({
  sendMinSeconds: z.number().nonnegative(),
  sendMaxSeconds: z.number().nonnegative(),
}).refine((s) => s.sendMinSeconds <= s.sendMaxSeconds, "SEND_MIN must not exceed SEND_MAX");
