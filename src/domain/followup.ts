/** Days after initial successful send, NOT after preceding follow-up. */
export const DEFAULT_FOLLOWUP_OFFSETS_DAYS = [14, 28, 40] as const;
export function followupDueAt(initialSentAt: Date, step: number, offsets: readonly number[] = DEFAULT_FOLLOWUP_OFFSETS_DAYS): Date {
  if (!Number.isInteger(step) || step < 1 || step > offsets.length) throw new RangeError("Invalid follow-up step");
  const result = new Date(initialSentAt);
  if (Number.isNaN(result.getTime())) throw new RangeError("Invalid initial send date");
  result.setUTCDate(result.getUTCDate() + offsets[step - 1]);
  return result;
}
