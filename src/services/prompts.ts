import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { supabase } from '../lib/supabase';
import { assertOk, errorMessage, unwrap } from './errors';
import { parsePrompts, ProfilePromptItem } from '../types/prompts';
import { PHOTO_BUCKET } from './photos';

export async function fetchMyPrompts(): Promise<ProfilePromptItem[]> {
  const rows = unwrap(
    await supabase.from('profile_prompts').select('slot, prompt, answer, photo_path').order('slot')
  );
  return parsePrompts(rows);
}

/** Replaces all of the user's prompts in one transaction (pass an empty list to clear them). */
export async function saveMyPrompts(items: ProfilePromptItem[]): Promise<void> {
  const payload = items.map((it) => ({
    slot: it.slot,
    prompt: it.prompt,
    answer: it.answer,
    photo_path: it.photoPath ?? null,
  }));
  assertOk(await supabase.rpc('set_my_prompts', { p_prompts: payload }));
}

function randomId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Compresses and uploads an image for a prompt to Supabase Storage, returning storage path. */
export async function uploadPromptPhoto(userId: string, localUri: string): Promise<string> {
  const ref = await ImageManipulator.manipulate(localUri).resize({ width: 1080 }).renderAsync();
  const saved = await ref.saveAsync({ format: SaveFormat.JPEG, compress: 0.8 });
  const storagePath = `${userId}/prompts/${randomId()}.jpg`;

  const bytes = await (await fetch(saved.uri)).arrayBuffer();
  const upload = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(storagePath, bytes, { contentType: 'image/jpeg', upsert: false });

  if (upload.error) {
    throw new Error(errorMessage(upload.error, 'Upload failed. Please try again.'));
  }
  return storagePath;
}
