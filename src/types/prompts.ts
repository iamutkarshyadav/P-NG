// Profile prompts: up to three question/answer slots per profile (see migration 15, profile_prompts).

export interface ProfilePromptItem {
  slot: number;
  prompt: string;
  answer: string;
  photoPath?: string | null;
}

export const MAX_PROMPTS = 3;
export const PROMPT_QUESTION_MAX = 80;
export const PROMPT_ANSWER_MAX = 300;

/** Starter questions offered in the editor. Anything up to 80 characters is accepted by the database. */
export const PROMPT_QUESTIONS: string[] = [
  'A perfect Sunday looks like',
  'The quickest way to my heart',
  'Together, we could',
  'My most controversial opinion',
  'I geek out on',
  'Typical Saturday night',
  'A shower thought I recently had',
  'The hallmark of a good date',
  'I get way too competitive about',
  'My love language is',
  'Two truths and a lie',
  'The best trip I ever took',
];

/** Reads the `prompts` JSON returned by discover_feed or get_profile_details, ignoring anything malformed. */
export function parsePrompts(value: unknown): ProfilePromptItem[] {
  if (!Array.isArray(value)) return [];
  const out: ProfilePromptItem[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const { slot, prompt, answer, photo_path, photoPath } = item as Record<string, unknown>;
    const path = typeof photo_path === 'string' && photo_path.trim() ? photo_path.trim() : typeof photoPath === 'string' && photoPath.trim() ? photoPath.trim() : null;
    if (typeof slot === 'number' && typeof prompt === 'string' && typeof answer === 'string' && prompt && answer) {
      out.push({ slot, prompt, answer, photoPath: path });
    }
  }
  return out.sort((a, b) => a.slot - b.slot);
}
