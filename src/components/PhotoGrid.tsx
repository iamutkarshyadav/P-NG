import React from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { BrutalBox } from './BrutalBox';
import { MAX_PHOTOS, PickSource, ProfilePhoto } from '../services/photos';
import { errorMessage } from '../services/errors';
import type { PhotoAddOutcome } from '../hooks/usePhotos';

interface PhotoGridProps {
  photos: ProfilePhoto[];
  uploadingSlots: number[];
  onAdd: (source: PickSource) => Promise<PhotoAddOutcome>;
  onRemove: (photo: ProfilePhoto) => Promise<void>;
  onMakePrimary: (photo: ProfilePhoto) => Promise<void>;
  /** Lower bound shown to the user; the continue button enforces it. */
  minPhotos?: number;
}

const DENIED_MESSAGE = 'Allow photo access in your device settings to add pictures.';

export const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  uploadingSlots,
  onAdd,
  onRemove,
  onMakePrimary,
  minPhotos = 2,
}) => {
  const run = async (task: () => Promise<PhotoAddOutcome | void>) => {
    try {
      const outcome = await task();
      if (outcome === 'denied') Alert.alert('Permission needed', DENIED_MESSAGE);
    } catch (e) {
      Alert.alert('Photo error', errorMessage(e));
    }
  };

  const startAdd = () => {
    if (Platform.OS === 'web') {
      run(() => onAdd('library'));
      return;
    }
    Alert.alert('Add a photo', 'Where should we get it?', [
      { text: 'Photo library', onPress: () => run(() => onAdd('library')) },
      { text: 'Take a photo', onPress: () => run(() => onAdd('camera')) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const confirmRemove = (photo: ProfilePhoto) => {
    const remove = () => run(() => onRemove(photo));
    if (photos.length <= minPhotos) {
      Alert.alert(
        'Remove photo?',
        `You need at least ${minPhotos} photos, so you will have to add another one.`,
        [{ text: 'Cancel', style: 'cancel' }, { text: 'Remove', style: 'destructive', onPress: remove }]
      );
    } else {
      remove();
    }
  };

  const byPosition = new Map(photos.map((p) => [p.position, p]));
  const firstEmpty = Array.from({ length: MAX_PHOTOS }, (_, i) => i).find(
    (i) => !byPosition.has(i) && !uploadingSlots.includes(i)
  );

  return (
    <View style={styles.grid}>
      {Array.from({ length: MAX_PHOTOS }, (_, position) => {
        const photo = byPosition.get(position);
        const uploading = uploadingSlots.includes(position);

        if (photo) {
          return (
            <View key={position} style={styles.item}>
              <BrutalBox
                backgroundColor="#FFFFFF"
                borderColor={colors.borderBlack}
                borderWidth={2.6}
                borderRadius={18}
                shadowOffset={{ x: 3.5, y: 3.5 }}
                overflow="visible"
                contentStyle={styles.slotContent}
              >
                {photo.url ? (
                  <Image
                    source={{ uri: photo.url }}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                    transition={150}
                    accessibilityLabel={`Photo ${position + 1}`}
                  />
                ) : (
                  <View style={[StyleSheet.absoluteFill, styles.missing]}>
                    <Feather name="image" size={26} color="#777" />
                  </View>
                )}
                {position === 0 && (
                  <View style={styles.primaryBadge}>
                    <Text style={styles.primaryBadgeText}>★ PRIMARY</Text>
                  </View>
                )}
                <View style={styles.indexBadge}>
                  <Text style={styles.indexText}>{position + 1}</Text>
                </View>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={`Remove photo ${position + 1}`}
                  onPress={() => confirmRemove(photo)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={[styles.roundButton, styles.removeButton]}
                >
                  <Feather name="x" size={15} color={colors.textDark} />
                </TouchableOpacity>
                {position !== 0 && (
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`Make photo ${position + 1} your primary photo`}
                    onPress={() => run(() => onMakePrimary(photo))}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={[styles.roundButton, styles.starButton]}
                  >
                    <Feather name="star" size={14} color={colors.textDark} />
                  </TouchableOpacity>
                )}
              </BrutalBox>
            </View>
          );
        }

        const isNext = position === firstEmpty;
        return (
          <View key={position} style={styles.item}>
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={uploading}
              onPress={startAdd}
              accessibilityRole="button"
              accessibilityLabel={`Add photo to slot ${position + 1}`}
              style={styles.dashedSlot}
            >
              <View style={styles.dashedIndex}>
                <Text style={styles.dashedIndexText}>{position + 1}</Text>
              </View>
              {uploading ? (
                <ActivityIndicator color={colors.primaryPink} />
              ) : (
                <>
                  <View style={isNext ? styles.yellowAdd : styles.greyAdd}>
                    <Feather name="plus" size={isNext ? 24 : 18} color={isNext ? colors.textDark : '#777'} />
                  </View>
                  <Text style={isNext ? styles.addLabel : styles.emptyLabel}>
                    {isNext ? 'ADD PHOTO' : `SLOT ${position + 1}`}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  item: { width: '48%', aspectRatio: 0.95 },
  slotContent: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  missing: { backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  primaryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.accentYellow,
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
  },
  primaryBadgeText: {
    fontSize: 9.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.4,
  },
  indexBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: { color: '#FFFFFF', fontSize: 11, fontFamily: typography.bodyExtraBold },
  roundButton: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: { top: 8, right: 8 },
  starButton: { bottom: 8, right: 8 },
  dashedSlot: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    borderWidth: 2.2,
    borderStyle: 'dashed',
    borderColor: colors.borderBlack,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  dashedIndex: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.6,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashedIndexText: { fontSize: 10.5, fontFamily: typography.bodyExtraBold, color: colors.textDark },
  yellowAdd: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accentYellow,
    borderWidth: 2.2,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greyAdd: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.8,
    borderColor: '#999',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addLabel: { fontSize: 11, fontFamily: typography.bodyExtraBold, color: colors.textDark, letterSpacing: 0.5 },
  emptyLabel: { fontSize: 10, fontFamily: typography.bodyBold, color: '#888', letterSpacing: 0.4 },
});
