import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { LAYOUT } from '../theme/responsive';
import { DotGridBackground } from '../components/DotGridBackground';
import { BrutalBox } from '../components/BrutalBox';
import { OnboardingTopHeader } from '../components/OnboardingTopHeader';
import { OnboardingBottomBar } from '../components/OnboardingBottomBar';
import { OnboardingHeadline } from '../components/OnboardingHeadline';
import { UserAccount } from '../types/user';
import { PhotoGrid } from '../components/PhotoGrid';
import { usePhotos } from '../hooks/usePhotos';
import { updateProfile } from '../services/profile';
import { errorMessage } from '../services/errors';

interface OnboardingPhotosScreenProps {
  user: UserAccount;
  onBack: () => void;
  onNext: (updatedUser: UserAccount) => void;
}

// Stylized Vector Graphic for Slot 1 (Cyberpunk Anime Girl with Teal Hair & Headphones)
export const OnboardingPhotosScreen: React.FC<OnboardingPhotosScreenProps> = ({
  user,
  onBack,
  onNext,
}) => {
  const { photos, isLoading, loadError, uploadingSlots, addPhoto, removePhoto, makePrimary } =
    usePhotos(user.id);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const MIN_PHOTOS = 2;

  const handleNext = async () => {
    if (photos.length < MIN_PHOTOS) {
      Alert.alert('Add more photos', `Please add at least ${MIN_PHOTOS} photos so people can see the real you.`);
      return;
    }
    if (uploadingSlots.length > 0) {
      Alert.alert('Hang on', 'A photo is still uploading.');
      return;
    }
    setIsSaving(true);
    try {
      onNext(await updateProfile(user, { onboarding_step: 6 }));
    } catch (e) {
      Alert.alert('Could not save', errorMessage(e));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <DotGridBackground />

      {/* 1. Universal Neo-Brutalist Onboarding Top Header */}
      <OnboardingTopHeader onBack={onBack} onPrevStep={onBack} user={user} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.contentSection}>
            {/* 2. Unified Headline with 5px Black Underline */}
            <OnboardingHeadline
              step="05"
              line1="ADD YOUR"
              focalWord="BEST PHOTOS"
              subtitle="Add at least 2 real photos to showcase your vibe."
            />

            {/* 4. 6-Slot Photo Grid (real uploads) */}
            {loadError ? (
              <Text style={styles.statusText}>Could not load your photos: {errorMessage(loadError)}</Text>
            ) : (
              <PhotoGrid
                photos={photos}
                uploadingSlots={uploadingSlots}
                onAdd={addPhoto}
                onRemove={removePhoto}
                onMakePrimary={makePrimary}
                minPhotos={MIN_PHOTOS}
              />
            )}
            {isLoading && <Text style={styles.statusText}>Loading your photos...</Text>}

          {/* 5. Consolidated Photo Guidelines Container */}
          <BrutalBox
            backgroundColor="#FFFFFF"
            borderColor={colors.borderBlack}
            borderWidth={2.4}
            borderRadius={16}
            shadowOffset={{ x: 3.5, y: 3.5 }}
            style={styles.fullWidth}
            contentStyle={styles.guidelinesContent}
          >
            <View style={styles.guidelinesHeaderRow}>
              <View style={styles.guidelinesTag}>
                <Text style={styles.guidelinesTagText}>PHOTO GUIDELINES</Text>
              </View>
            </View>
            <Text style={styles.guidelinesMainText}>
              Your first photo is your cover on Discover. Use clear, solo photos with good lighting.
            </Text>
            <View style={styles.rulesItemsRow}>
              <Text style={styles.ruleItemText}>NO SUNGLASSES ONLY</Text>
              <View style={styles.ruleDot} />
              <Text style={styles.ruleItemText}>NO GROUP CONFUSION</Text>
              <View style={styles.ruleDot} />
              <Text style={styles.ruleItemText}>100% REAL</Text>
            </View>
          </BrutalBox>
          </View>
        </View>
      </ScrollView>

      {/* 7. Pinned Bottom Action Button */}
      <View style={styles.bottomBarWrapper}>
        <OnboardingBottomBar
          onNext={handleNext}
          onBack={onBack}
          showSkip={false}
          isSaving={isSaving}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgCream,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: LAYOUT.shellMaxWidth,
    alignSelf: 'center',
    alignItems: 'flex-start',
    gap: 20,
  },
  bottomBarWrapper: {
    width: '100%',
    maxWidth: LAYOUT.shellMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 12 : 16,
  },
  contentSection: {
    width: '100%',
    alignItems: 'flex-start',
    gap: 18,
  },
  fullWidth: {
    width: '100%',
  },
  statusText: {
    fontSize: 13,
    fontFamily: typography.bodyMedium,
    color: '#333333',
    marginVertical: 4,
  },

  /* Photo Grid */
  gridContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  gridItem: {
    width: '48%',
    aspectRatio: 0.95,
  },
  photoSlotContent: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  primaryBadgeWrapper: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 10,
  },
  primaryBadge: {
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
  slotIndexBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  slotIndexText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: typography.bodyExtraBold,
  },
  reorderBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.6,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  /* Dashed Slots */
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
    position: 'relative',
    gap: 6,
  },
  extraSlotFilled: {
    backgroundColor: '#FEF08A',
  },
  dashedSlotIndex: {
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
  dashedSlotIndexText: {
    fontSize: 10.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
  },
  yellowAddCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accentYellow,
    borderWidth: 2.2,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
    // hard offset shadow
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  greyAddCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.6,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoLabel: {
    fontSize: 11,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.4,
  },
  slotEmptyLabel: {
    fontSize: 10.5,
    fontFamily: typography.bodyBold,
    color: '#6B7280',
    letterSpacing: 0.4,
  },

  /* Photo Guidelines Card */
  guidelinesContent: {
    padding: 14,
    gap: 10,
  },
  guidelinesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guidelinesTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: colors.accentYellow,
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    borderRadius: 6,
  },
  guidelinesTagText: {
    fontSize: 10,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.8,
  },
  guidelinesMainText: {
    fontSize: 12,
    fontFamily: typography.bodySemiBold,
    color: colors.textDark,
    lineHeight: 17,
  },
  rulesItemsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 4,
    borderTopWidth: 1.5,
    borderTopColor: '#F3F4F6',
  },
  ruleItemText: {
    fontSize: 10,
    fontFamily: typography.bodyExtraBold,
    color: '#4B5563',
    letterSpacing: 0.4,
  },
  ruleDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderBlack,
  },
});
