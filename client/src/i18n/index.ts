import { isAxiosError } from 'axios';
import { en } from './en';
import type { Messages } from './en';

export type { Messages };

/**
 * Returns the UI strings for the current language. Only English exists for
 * now; switching languages later means changing this hook, not its callers.
 */
export const useT = (): Messages => en;

/** Display name for an offered or inventory item: flower keys are translated, user-given names are shown as-is. */
export const itemLabel = (t: Messages, name: string) => t.flowers[name] ?? name;

/** User-facing text for a failed API call, looked up by the response's error `code`. */
export const errorText = (t: Messages, error: unknown) => {
  const code = isAxiosError(error) ? error.response?.data?.code : undefined;
  return (typeof code === 'string' && t.errors[code]) || t.errors.generic;
};
