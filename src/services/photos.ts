import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { supabase } from '../lib/supabase';
import { assertOk, errorMessage, unwrap } from './errors';

export const MAX_PHOTOS = 6;
export const PHOTO_BUCKET = 'profile-photos';
const SIGNED_URL_TTL_SECONDS = 60 * 60;
const MAX_EDGE_PX = 1080;

export interface ProfilePhoto {
  id: string;
  storagePath: string;
  position: number;
  url: string | null;
}

function randomId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Signed URLs for a batch of storage paths, keyed by path. Missing/denied paths are omitted. */
export async function signedUrls(paths: string[]): Promise<Record<string, string>> {
  const unique = Array.from(new Set(paths.filter(Boolean)));
  if (unique.length === 0) return {};
  const { data, error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .createSignedUrls(unique, SIGNED_URL_TTL_SECONDS);
  if (error) throw new Error(errorMessage(error));
  const out: Record<string, string> = {};
  for (const item of data ?? []) {
    if (item.path && item.signedUrl) out[item.path] = item.signedUrl;
  }
  return out;
}

export async function fetchMyPhotos(userId: string): Promise<ProfilePhoto[]> {
  const rows = unwrap(
    await supabase
      .from('photos')
      .select('id, storage_path, position')
      .eq('user_id', userId)
      .order('position')
  );
  const urls = await signedUrls(rows.map((r) => r.storage_path));
  return rows.map((r) => ({
    id: r.id,
    storagePath: r.storage_path,
    position: r.position,
    url: urls[r.storage_path] ?? null,
  }));
}

export type PickSource = 'library' | 'camera';
export type PickResult = { uri: string } | { denied: true } | null;

/** Opens the system picker. Null means the user cancelled; `denied` means permission was refused. */
export async function pickPhotoUri(source: PickSource): Promise<PickResult> {
  const perm =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return { denied: true };

  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [3, 4],
    quality: 1,
  };
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
  const asset = result.canceled ? undefined : result.assets?.[0];
  return asset ? { uri: asset.uri } : null;
}

async function compress(uri: string): Promise<{ uri: string; width: number; height: number }> {
  const ref = await ImageManipulator.manipulate(uri).resize({ width: MAX_EDGE_PX }).renderAsync();
  const saved = await ref.saveAsync({ format: SaveFormat.JPEG, compress: 0.8 });
  return { uri: saved.uri, width: saved.width, height: saved.height };
}

/** Compresses, uploads to private storage under `{userId}/`, then records the photo row. */
export async function uploadPhoto(
  userId: string,
  localUri: string,
  position: number
): Promise<ProfilePhoto> {
  if (position < 0 || position >= MAX_PHOTOS) {
    throw new Error(`You can add up to ${MAX_PHOTOS} photos.`);
  }
  const image = await compress(localUri);
  const storagePath = `${userId}/${randomId()}.jpg`;

  const bytes = await (await fetch(image.uri)).arrayBuffer();
  const upload = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(storagePath, bytes, { contentType: 'image/jpeg', upsert: false });
  if (upload.error) {
    throw new Error(errorMessage(upload.error, 'Upload failed. Please try again.'));
  }

  const inserted = await supabase
    .from('photos')
    .insert({
      user_id: userId,
      storage_path: storagePath,
      position,
      width: image.width,
      height: image.height,
    })
    .select('id, storage_path, position')
    .single();
  if (inserted.error) {
    // Do not leave an orphaned file behind if the row could not be recorded.
    await supabase.storage.from(PHOTO_BUCKET).remove([storagePath]);
    throw new Error(errorMessage(inserted.error));
  }
  const urls = await signedUrls([storagePath]);
  return {
    id: inserted.data.id,
    storagePath,
    position: inserted.data.position,
    url: urls[storagePath] ?? null,
  };
}

export async function deletePhoto(photo: Pick<ProfilePhoto, 'id' | 'storagePath'>): Promise<void> {
  assertOk(await supabase.from('photos').delete().eq('id', photo.id));
  await supabase.storage.from(PHOTO_BUCKET).remove([photo.storagePath]);
}

/** Rewrites positions 0..n-1 in the given order, atomically (server-side, one statement). */
export async function reorderPhotos(orderedIds: string[]): Promise<void> {
  if (orderedIds.length === 0) return;
  assertOk(await supabase.rpc('reorder_photos', { p_ordered_ids: orderedIds }));
}
