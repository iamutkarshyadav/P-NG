import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { BrutalBox } from './BrutalBox';
import {
  MAX_PROMPTS,
  PROMPT_ANSWER_MAX,
  PROMPT_QUESTIONS,
  PROMPT_QUESTION_MAX,
  ProfilePromptItem,
} from '../types/prompts';
import { pickPhotoUri } from '../services/photos';
import { uploadPromptPhoto } from '../services/prompts';
import { useSignedUrls } from '../hooks/useSignedUrls';
import { errorMessage } from '../services/errors';
import { reportError } from '../lib/monitoring';

interface ProfilePromptsEditorProps {
  userId: string;
  value: ProfilePromptItem[];
  onChange: (next: ProfilePromptItem[]) => void;
}

/** Three prompt slots: pick a question, write an answer, and optionally attach a photo. */
export const ProfilePromptsEditor: React.FC<ProfilePromptsEditorProps> = ({
  userId,
  value,
  onChange,
}) => {
  const [pickingSlot, setPickingSlot] = useState<number | null>(null);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);

  // Extract all existing prompt photo paths to show thumbnails
  const photoPaths = value.map((p) => p.photoPath).filter((p): p is string => Boolean(p));
  const photoUrls = useSignedUrls(photoPaths);

  const bySlot = (slot: number) => value.find((p) => p.slot === slot);

  const update = (slot: number, patch: Partial<ProfilePromptItem>) => {
    const current = bySlot(slot) ?? { slot, prompt: '', answer: '' };
    const next = { ...current, ...patch };
    const rest = value.filter((p) => p.slot !== slot);
    onChange([...rest, next].sort((a, b) => a.slot - b.slot));
  };

  const clear = (slot: number) => {
    onChange(value.filter((p) => p.slot !== slot));
    if (pickingSlot === slot) setPickingSlot(null);
  };

  const handlePickPhoto = async (slot: number) => {
    try {
      const res = await pickPhotoUri('library');
      if (!res) return;
      if ('denied' in res) {
        Alert.alert('Permission Needed', 'Please allow photo library access to attach photos to prompts.');
        return;
      }
      setUploadingSlot(slot);
      const storagePath = await uploadPromptPhoto(userId, res.uri);
      update(slot, { photoPath: storagePath });
    } catch (e) {
      reportError(e, 'ProfilePromptsEditor.handlePickPhoto');
      Alert.alert('Upload Failed', errorMessage(e));
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleRemovePhoto = (slot: number) => {
    update(slot, { photoPath: null });
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>PROMPTS & STORIES</Text>
      <Text style={styles.hint}>Answer up to {MAX_PROMPTS}. You can optionally attach a photo to each answer!</Text>

      {Array.from({ length: MAX_PROMPTS }, (_, i) => i + 1).map((slot) => {
        const item = bySlot(slot);
        const picking = pickingSlot === slot;
        const isUploading = uploadingSlot === slot;
        const currentPhotoUrl = item?.photoPath ? photoUrls[item.photoPath] : null;

        return (
          <BrutalBox
            key={slot}
            backgroundColor="#FFFBEB"
            borderColor={colors.borderBlack}
            borderWidth={3}
            borderRadius={20}
            shadowOffset={{ x: 4, y: 4 }}
            contentStyle={styles.card}
          >
            {/* Card Header: Slot Badge & Remove Prompt */}
            <View style={styles.cardHeader}>
              <View style={styles.slotBadgeWrap}>
                <Text style={styles.slotBadge}>PROMPT {slot}</Text>
                {item?.photoPath && (
                  <View style={styles.photoAttachedPill}>
                    <Ionicons name="image" size={11} color="#000" />
                    <Text style={styles.photoAttachedText}>PHOTO ATTACHED</Text>
                  </View>
                )}
              </View>
              {item ? (
                <TouchableOpacity
                  onPress={() => clear(slot)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove prompt ${slot}`}
                >
                  <Ionicons name="close-circle" size={22} color={colors.textDark} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Question Selector Trigger */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setPickingSlot(picking ? null : slot)}
              accessibilityRole="button"
              accessibilityLabel={`Choose a question for prompt ${slot}`}
            >
              <Text style={[styles.question, !item?.prompt && styles.questionEmpty]}>
                {item?.prompt ? item.prompt.toUpperCase() : 'TAP TO PICK A QUESTION'}
              </Text>
            </TouchableOpacity>

            {/* Questions Pill Picker */}
            {picking ? (
              <View style={styles.pills}>
                {PROMPT_QUESTIONS.map((q) => (
                  <TouchableOpacity
                    key={q}
                    activeOpacity={0.8}
                    onPress={() => {
                      update(slot, { prompt: q.slice(0, PROMPT_QUESTION_MAX) });
                      setPickingSlot(null);
                    }}
                    style={[styles.pill, item?.prompt === q && styles.pillSelected]}
                  >
                    <Text style={styles.pillText}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {/* Answer Input */}
            {item?.prompt ? (
              <View style={styles.answerBox}>
                <TextInput
                  style={styles.answerInput}
                  value={item.answer}
                  onChangeText={(t) => update(slot, { answer: t })}
                  maxLength={PROMPT_ANSWER_MAX}
                  multiline
                  placeholder="Your answer..."
                  placeholderTextColor="#888"
                  accessibilityLabel={`Answer for prompt ${slot}`}
                />
                <Text style={styles.counter}>
                  {item.answer.length}/{PROMPT_ANSWER_MAX}
                </Text>
              </View>
            ) : null}

            {/* Optional Photo Attachment Section */}
            {item?.prompt ? (
              <View style={styles.photoSection}>
                {isUploading ? (
                  <View style={styles.uploadingBox}>
                    <ActivityIndicator size="small" color={colors.primaryPink} />
                    <Text style={styles.uploadingText}>UPLOADING PROMPT PHOTO...</Text>
                  </View>
                ) : currentPhotoUrl ? (
                  <View style={styles.photoPreviewCard}>
                    <View style={styles.thumbnailWrapper}>
                      <Image
                        source={{ uri: currentPhotoUrl }}
                        style={StyleSheet.absoluteFill}
                        contentFit="cover"
                        transition={150}
                      />
                    </View>
                    <View style={styles.photoActionsCol}>
                      <Text style={styles.photoAttachedHeading}>ATTACHED IMAGE</Text>
                      <View style={styles.photoBtnRow}>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => handlePickPhoto(slot)}
                          style={styles.photoActionBtn}
                        >
                          <Feather name="refresh-cw" size={12} color="#000" />
                          <Text style={styles.photoActionBtnText}>CHANGE</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => handleRemovePhoto(slot)}
                          style={[styles.photoActionBtn, styles.photoRemoveBtn]}
                        >
                          <Feather name="trash-2" size={12} color="#DC2626" />
                          <Text style={[styles.photoActionBtnText, { color: '#DC2626' }]}>REMOVE</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handlePickPhoto(slot)}
                    style={styles.addPhotoDashedBtn}
                  >
                    <Feather name="camera" size={16} color={colors.textDark} style={{ marginRight: 6 }} />
                    <Text style={styles.addPhotoDashedText}>ADD PHOTO TO THIS PROMPT (OPTIONAL)</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : null}
          </BrutalBox>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: 12, marginTop: 8 },
  label: { fontFamily: typography.bodyExtraBold, fontSize: 12, letterSpacing: 0.5, color: colors.textDark },
  hint: { fontFamily: typography.bodyMedium, fontSize: 12, color: '#6B7280', marginTop: -6 },
  card: { padding: 16, gap: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  slotBadgeWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  slotBadge: { fontFamily: typography.bodyExtraBold, fontSize: 11, letterSpacing: 0.5, color: '#4B5563' },
  photoAttachedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accentYellow,
    borderWidth: 1.5,
    borderColor: colors.borderBlack,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  photoAttachedText: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 9,
    color: '#000',
    letterSpacing: 0.3,
  },
  question: { fontFamily: typography.headline, fontSize: 19, lineHeight: 23, letterSpacing: 0.4, color: colors.textDark },
  questionEmpty: { color: '#9CA3AF' },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  pillSelected: { backgroundColor: colors.accentYellow },
  pillText: { fontFamily: typography.bodyBold, fontSize: 12, color: colors.textDark },
  answerBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.borderBlack,
    borderRadius: 14,
    padding: 10,
  },
  answerInput: {
    fontFamily: typography.bodySemiBold,
    fontSize: 15,
    lineHeight: 21,
    color: colors.textDark,
    minHeight: 64,
    textAlignVertical: 'top',
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : {}),
  },
  counter: { alignSelf: 'flex-end', fontFamily: typography.bodyMedium, fontSize: 11, color: '#6B7280' },
  photoSection: {
    marginTop: 4,
  },
  addPhotoDashedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  addPhotoDashedText: {
    fontFamily: typography.bodyBold,
    fontSize: 12,
    color: colors.textDark,
    letterSpacing: 0.3,
  },
  uploadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
  },
  uploadingText: {
    fontFamily: typography.bodyBold,
    fontSize: 11.5,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  photoPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    borderRadius: 14,
    padding: 8,
  },
  thumbnailWrapper: {
    width: 64,
    height: 64,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.borderBlack,
    backgroundColor: '#E5E7EB',
  },
  photoActionsCol: {
    flex: 1,
    gap: 6,
  },
  photoAttachedHeading: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 10.5,
    color: '#4B5563',
    letterSpacing: 0.5,
  },
  photoBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  photoActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: colors.borderBlack,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  photoRemoveBtn: {
    backgroundColor: '#FEF2F2',
  },
  photoActionBtnText: {
    fontFamily: typography.bodyBold,
    fontSize: 10.5,
    color: colors.textDark,
  },
});
