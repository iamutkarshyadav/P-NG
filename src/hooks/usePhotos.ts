import { useCallback, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  MAX_PHOTOS,
  PickSource,
  ProfilePhoto,
  deletePhoto,
  fetchMyPhotos,
  pickPhotoUri,
  reorderPhotos,
  uploadPhoto,
} from '../services/photos';
import { reportError } from '../lib/monitoring';

export type PhotoAddOutcome = 'added' | 'cancelled' | 'denied';

export function usePhotos(userId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['photos', userId] as const;
  const query = useQuery({ queryKey, queryFn: () => fetchMyPhotos(userId) });
  const [uploadingSlots, setUploadingSlots] = useState<number[]>([]);
  const activeUploadsRef = useRef<Set<number>>(new Set());

  const photos: ProfilePhoto[] = query.data ?? [];
  const refresh = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['photos', userId] }),
    [queryClient, userId]
  );

  /** Picks an image and uploads it into the first free slot, preventing concurrent slot collisions. */
  const addPhoto = useCallback(
    async (source: PickSource): Promise<PhotoAddOutcome> => {
      const committed = new Set(photos.map((p) => p.position));
      let slot = -1;
      for (let i = 0; i < MAX_PHOTOS; i += 1) {
        if (!committed.has(i) && !activeUploadsRef.current.has(i)) {
          slot = i;
          break;
        }
      }
      if (slot === -1) throw new Error(`You can add up to ${MAX_PHOTOS} photos.`);

      const picked = await pickPhotoUri(source);
      if (!picked) return 'cancelled';
      if ('denied' in picked) return 'denied';

      // Reserve slot immediately in sync ref and update UI state
      activeUploadsRef.current.add(slot);
      setUploadingSlots(Array.from(activeUploadsRef.current));

      try {
        await uploadPhoto(userId, picked.uri, slot);
        await refresh();
        return 'added';
      } catch (err) {
        reportError(err, 'usePhotos.addPhoto');
        throw err;
      } finally {
        activeUploadsRef.current.delete(slot);
        setUploadingSlots(Array.from(activeUploadsRef.current));
      }
    },
    [photos, userId, refresh]
  );

  const removePhoto = useCallback(
    async (photo: ProfilePhoto) => {
      try {
        await deletePhoto(photo);
        await refresh();
      } catch (err) {
        reportError(err, 'usePhotos.removePhoto');
        throw err;
      }
    },
    [refresh]
  );

  const reorder = useCallback(
    async (orderedIds: string[]) => {
      try {
        await reorderPhotos(orderedIds);
        await refresh();
      } catch (err) {
        reportError(err, 'usePhotos.reorderPhotos');
        throw err;
      }
    },
    [refresh]
  );

  const makePrimary = useCallback(
    async (photo: ProfilePhoto) => {
      const ordered = [photo, ...photos.filter((p) => p.id !== photo.id)].map((p) => p.id);
      await reorder(ordered);
    },
    [photos, reorder]
  );

  return {
    photos,
    isLoading: query.isLoading,
    loadError: query.error as Error | null,
    uploadingSlots,
    addPhoto,
    removePhoto,
    makePrimary,
    reorderPhotos: reorder,
    refresh,
  };
}
