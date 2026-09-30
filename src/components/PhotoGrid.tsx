import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { BrutalBox } from './BrutalBox';
import { MAX_PHOTOS, PickSource, ProfilePhoto } from '../services/photos';
import { errorMessage } from '../services/errors';
import { haptic } from '../lib/haptics';
import { reportError } from '../lib/monitoring';
import type { PhotoAddOutcome } from '../hooks/usePhotos';

interface PhotoGridProps {
  photos: ProfilePhoto[];
  uploadingSlots: number[];
  onAdd: (source: PickSource) => Promise<PhotoAddOutcome>;
  onRemove: (photo: ProfilePhoto) => Promise<void>;
  onMakePrimary: (photo: ProfilePhoto) => Promise<void>;
  onReorder?: (orderedIds: string[]) => Promise<void>;
  captions?: Record<number, string>;
  onCaptionChange?: (position: number, text: string) => void;
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
  onReorder,
  captions,
  onCaptionChange,
  minPhotos = 2,
}) => {
  const run = async (task: () => Promise<PhotoAddOutcome | void>) => {
    try {
      const outcome = await task();
      if (outcome === 'denied') Alert.alert('Permission needed', DENIED_MESSAGE);
    } catch (e) {
      reportError(e, 'PhotoGrid.run');
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

  const sortedPhotos = [...photos].sort((a, b) => a.position - b.position);

  const handleSwapByIndex = (fromIdx: number, toIdx: number) => {
    if (!onReorder) return;
    if (fromIdx < 0 || fromIdx >= sortedPhotos.length || toIdx < 0 || toIdx >= sortedPhotos.length) return;

    const reordered = [...sortedPhotos];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);

    haptic(true, 'tap');
    run(() => onReorder(reordered.map((p) => p.id)));
  };

  const byPosition = new Map(photos.map((p) => [p.position, p]));
  const firstEmpty = Array.from({ length: MAX_PHOTOS }, (_, i) => i).find(
    (i) => !byPosition.has(i) && !uploadingSlots.includes(i)
  );

  const hasCaptions = Boolean(onCaptionChange);

  return (
    <View style={styles.grid}>
      {Array.from({ length: MAX_PHOTOS }, (_, position) => {
        const photo = byPosition.get(position);
        const uploading = uploadingSlots.includes(position);
        const supportsCaption = hasCaptions && (position === 1 || position === 2);
        const captionText = captions?.[position] ?? '';

        if (photo) {
          return (
            <View
              key={position}
              style={[
                styles.item,
                supportsCaption && styles.itemWithCaption,
              ]}
            >
              <BrutalBox
                backgroundColor="#FFFFFF"
                borderColor={colors.borderBlack}
                borderWidth={2.4}
                borderRadius={18}
                shadowOffset={{ x: 3, y: 3 }}
                overflow="visible"
                contentStyle={styles.slotCardContent}
              >
                {/* Photo Image Viewport */}
                <View style={[styles.photoViewport, supportsCaption && styles.photoViewportWithCaption]}>
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

                  {/* Primary / Slot Badge */}
                  {(() => {
                    const sortedIndex = sortedPhotos.findIndex((p) => p.id === photo.id);
                    const isPrimary = sortedIndex === 0;
                    return (
                      <>
                        {isPrimary ? (
                          <View style={styles.primaryBadge}>
                            <Feather name="star" size={9} color={colors.textDark} style={{ marginRight: 3 }} />
                            <Text style={styles.primaryBadgeText}>PRIMARY</Text>
                          </View>
                        ) : (
                          <View style={styles.indexBadge}>
                            <Text style={styles.indexText}>{sortedIndex + 1}</Text>
                          </View>
                        )}

                        {/* Remove Button */}
                        <TouchableOpacity
                          accessibilityRole="button"
                          accessibilityLabel={`Remove photo ${sortedIndex + 1}`}
                          onPress={() => confirmRemove(photo)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          style={[styles.roundButton, styles.removeButton]}
                        >
                          <Feather name="x" size={14} color={colors.textDark} />
                        </TouchableOpacity>

                        {/* Reorder Action Pill / Controls */}
                        <View style={styles.reorderControlsRow}>
                          {sortedIndex > 0 && onReorder && (
                            <TouchableOpacity
                              accessibilityRole="button"
                              accessibilityLabel={`Move photo ${sortedIndex + 1} left`}
                              onPress={() => handleSwapByIndex(sortedIndex, sortedIndex - 1)}
                              style={styles.microArrowBtn}
                              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                            >
                              <Feather name="chevron-left" size={15} color={colors.textDark} />
                            </TouchableOpacity>
                          )}
                          {sortedIndex > 0 && (
                            <TouchableOpacity
                              accessibilityRole="button"
                              accessibilityLabel={`Make photo ${sortedIndex + 1} primary`}
                              onPress={() => run(() => onMakePrimary(photo))}
                              style={styles.microStarBtn}
                              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                            >
                              <Feather name="star" size={13} color={colors.textDark} />
                            </TouchableOpacity>
                          )}
                          {sortedIndex < sortedPhotos.length - 1 && onReorder && (
                            <TouchableOpacity
                              accessibilityRole="button"
                              accessibilityLabel={`Move photo ${sortedIndex + 1} right`}
                              onPress={() => handleSwapByIndex(sortedIndex, sortedIndex + 1)}
                              style={styles.microArrowBtn}
                              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                            >
                              <Feather name="chevron-right" size={15} color={colors.textDark} />
                            </TouchableOpacity>
                          )}
                        </View>
                      </>
                    );
                  })()}
                </View>

                {/* Inline Caption Input (directly anchored beneath Photo 2 / Photo 3) */}
                {supportsCaption && (
                  <View style={styles.captionContainer}>
                    <View style={styles.captionHeaderRow}>
                      <Text style={styles.captionHeaderLabel}>
                        PHOTO {position + 1} CAPTION
                      </Text>
                      <Text style={styles.captionCount}>
                        {captionText.length}/200
                      </Text>
                    </View>
                    <TextInput
                      style={styles.captionInput}
                      value={captionText}
                      onChangeText={(text) => onCaptionChange?.(position, text)}
                      maxLength={200}
                      placeholder={`Add a backstory for photo ${position + 1}...`}
                      placeholderTextColor="#8E8E93"
                      multiline
                      numberOfLines={2}
                      accessibilityLabel={`Photo ${position + 1} caption`}
                    />
                  </View>
                )}
              </BrutalBox>
            </View>
          );
        }

        const isNext = position === firstEmpty;
        return (
          <View
            key={position}
            style={[
              styles.item,
              supportsCaption && styles.itemWithCaption,
            ]}
          >
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
                    <Feather name="plus" size={isNext ? 22 : 16} color={isNext ? colors.textDark : '#777'} />
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
    rowGap: 16,
  },
  item: {
    width: '48%',
    height: 180,
  },
  itemWithCaption: {
    height: 252,
  },
  slotCardContent: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FAF7F2',
    display: 'flex',
    flexDirection: 'column',
  },
  photoViewport: {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  photoViewportWithCaption: {
    height: 154,
    borderBottomWidth: 2,
    borderBottomColor: colors.borderBlack,
  },
  missing: {
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBadge: {
    position: 'absolute',
    top: 7,
    left: 7,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentYellow,
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  primaryBadgeText: {
    fontSize: 9,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.4,
  },
  indexBadge: {
    position: 'absolute',
    top: 7,
    left: 7,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontFamily: typography.bodyExtraBold,
  },
  roundButton: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    top: 7,
    right: 7,
  },
  reorderControlsRow: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.borderBlack,
  },
  microArrowBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  microStarBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentYellow,
    borderWidth: 1,
    borderColor: colors.borderBlack,
  },
  captionContainer: {
    flex: 1,
    padding: 6,
    backgroundColor: '#FAF7F2',
    justifyContent: 'space-between',
  },
  captionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  captionHeaderLabel: {
    fontSize: 9,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.3,
  },
  captionCount: {
    fontSize: 8.5,
    fontFamily: typography.bodyBold,
    color: '#8E8E93',
  },
  captionInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.borderBlack,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    fontSize: 10.5,
    fontFamily: typography.bodyRegular,
    color: colors.textDark,
    minHeight: 46,
    textAlignVertical: 'top',
  },
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
  dashedIndexText: {
    fontSize: 10.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
  },
  yellowAdd: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentYellow,
    borderWidth: 2.2,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greyAdd: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.8,
    borderColor: '#999',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addLabel: {
    fontSize: 10.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  emptyLabel: {
    fontSize: 9.5,
    fontFamily: typography.bodyBold,
    color: '#888',
    letterSpacing: 0.4,
  },
});

