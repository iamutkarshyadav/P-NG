import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Platform, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { BrutalBox } from '../../components/BrutalBox';
import { errorMessage } from '../../services/errors';
import { requestVerificationChallenge, submitVerificationPhoto } from '../../services/safety';

interface SelfieVerificationScreenProps {
  userId: string;
  onClose: () => void;
  /** Called after the selfie and pose have been filed for review. */
  onSubmitted: () => void;
}

/**
 * Selfie verification: the server picks a pose, the person strikes it on the front camera, and a reviewer checks
 * the photo against that pose. Render this inside a full-screen Modal (its onRequestClose handles Android back).
 */
export const SelfieVerificationScreen: React.FC<SelfieVerificationScreenProps> = ({ userId, onClose, onSubmitted }) => {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [challenge, setChallenge] = useState<string | null>(null);
  const [challengeError, setChallengeError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [busy, setBusy] = useState<'capture' | 'submit' | null>(null);

  const loadChallenge = useCallback(async () => {
    setChallengeError(null);
    try {
      setChallenge(await requestVerificationChallenge());
    } catch (e) {
      setChallenge(null);
      setChallengeError(errorMessage(e));
    }
  }, []);

  useEffect(() => {
    if (permission?.granted) loadChallenge();
  }, [permission?.granted, loadChallenge]);

  // A fresh CameraView mounts after a retake; it is not ready until it says so.
  useEffect(() => {
    if (photoUri === null) setCameraReady(false);
  }, [photoUri]);

  const capture = async () => {
    if (!cameraRef.current || !cameraReady || busy) return;
    setBusy('capture');
    try {
      const picture = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (picture?.uri) {
        setPhotoUri(picture.uri);
      }
    } catch (e) {
      Alert.alert('Could not take the photo', errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const submit = async () => {
    if (!photoUri || busy) return;
    setBusy('submit');
    try {
      await submitVerificationPhoto(userId, photoUri);
      onSubmitted();
    } catch (e) {
      const message = errorMessage(e);
      if (/expired/i.test(message)) {
        // The pose is only valid for a few minutes: get a fresh one and retake.
        setPhotoUri(null);
        await loadChallenge();
        Alert.alert('New pose', 'That pose expired. Take your selfie again with the new one.');
      } else {
        Alert.alert('Could not submit selfie', message);
      }
    } finally {
      setBusy(null);
    }
  };

  const header = (
    <View style={styles.header}>
      <BrutalBox
        backgroundColor="#FFFFFF"
        borderColor={colors.borderBlack}
        borderWidth={2}
        borderRadius={12}
        shadowOffset={{ x: 2, y: 2 }}
        onPress={onClose}
        contentStyle={styles.closeButton}
      >
        <Ionicons name="close" size={20} color="#18181B" />
      </BrutalBox>
      <Text style={styles.title}>PROVE YOU&apos;RE REAL</Text>
    </View>
  );

  if (!permission) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        {header}
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primaryPink} />
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        {header}
        <View style={styles.center}>
          <Ionicons name="camera-outline" size={44} color={colors.primaryPink} />
          <Text style={styles.stateTitle}>CAMERA NEEDED</Text>
          <Text style={styles.stateBody}>P!NG uses your front camera for one verification selfie. Nothing is posted.</Text>
          <BrutalBox
            backgroundColor={colors.accentYellow}
            borderColor={colors.borderBlack}
            borderWidth={2.6}
            borderRadius={16}
            shadowOffset={{ x: 3, y: 3 }}
            onPress={() => (permission.canAskAgain ? requestPermission() : Linking.openSettings())}
            contentStyle={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>{permission.canAskAgain ? 'ALLOW CAMERA' : 'OPEN SETTINGS'}</Text>
          </BrutalBox>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) }]}>
      {header}

      <BrutalBox
        backgroundColor={colors.accentYellow}
        borderColor={colors.borderBlack}
        borderWidth={3}
        borderRadius={20}
        shadowOffset={{ x: 4, y: 4 }}
        contentStyle={styles.poseCard}
      >
        <Text style={styles.poseLabel}>STRIKE THIS POSE</Text>
        {challenge ? (
          <Text style={styles.poseText}>{challenge.toUpperCase()}</Text>
        ) : challengeError ? (
          <View style={styles.poseError}>
            <Text style={styles.poseErrorText}>{challengeError}</Text>
            <BrutalBox
              backgroundColor="#FFFFFF"
              borderColor={colors.borderBlack}
              borderWidth={2}
              borderRadius={12}
              shadowOffset={{ x: 2, y: 2 }}
              onPress={loadChallenge}
              contentStyle={styles.retryButton}
            >
              <Text style={styles.retryText}>TRY AGAIN</Text>
            </BrutalBox>
          </View>
        ) : (
          <ActivityIndicator color={colors.textDark} />
        )}
      </BrutalBox>

      <View style={styles.frame}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing="front"
            onCameraReady={() => setCameraReady(true)}
            onMountError={(e) => Alert.alert('Camera unavailable', e.message)}
          />
        )}
      </View>

      <View style={styles.actions}>
        {photoUri ? (
          <>
            <BrutalBox
              backgroundColor="#FFFFFF"
              borderColor={colors.borderBlack}
              borderWidth={2.6}
              borderRadius={16}
              shadowOffset={{ x: 3, y: 3 }}
              onPress={() => setPhotoUri(null)}
              disabled={busy !== null}
              style={styles.actionFlex}
              contentStyle={styles.primaryButton}
            >
              <Text style={styles.secondaryButtonText}>RETAKE</Text>
            </BrutalBox>
            <BrutalBox
              backgroundColor={colors.primaryPink}
              borderColor={colors.borderBlack}
              borderWidth={2.6}
              borderRadius={16}
              shadowOffset={{ x: 3, y: 3 }}
              onPress={submit}
              disabled={busy !== null}
              style={styles.actionFlex}
              contentStyle={styles.primaryButton}
            >
              {busy === 'submit' ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonLight}>SUBMIT</Text>
              )}
            </BrutalBox>
          </>
        ) : (
          <BrutalBox
            backgroundColor={colors.primaryPink}
            borderColor={colors.borderBlack}
            borderWidth={2.6}
            borderRadius={16}
            shadowOffset={{ x: 3, y: 3 }}
            onPress={capture}
            disabled={!cameraReady || !challenge || busy !== null}
            style={styles.actionFlex}
            contentStyle={styles.primaryButton}
          >
            {busy === 'capture' ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="camera" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.primaryButtonLight}>TAKE SELFIE</Text>
              </>
            )}
          </BrutalBox>
        )}
      </View>

      <Text style={styles.footnote}>
        A person on our team compares your selfie with your profile photos. Only you and our reviewers can see it.
        {Platform.OS === 'web' ? ' Camera access depends on your browser.' : ''}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAF7F2', paddingHorizontal: 16, gap: 14 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  closeButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: typography.headline, fontSize: 24, letterSpacing: 0.6, color: colors.textDark },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 24 },
  stateTitle: { fontFamily: typography.headline, fontSize: 22, letterSpacing: 0.6, color: colors.textDark },
  stateBody: { fontFamily: typography.bodyMedium, fontSize: 14, lineHeight: 20, color: '#4B5563', textAlign: 'center' },
  poseCard: { paddingVertical: 14, paddingHorizontal: 16, gap: 4, alignItems: 'center' },
  poseLabel: { fontFamily: typography.bodyExtraBold, fontSize: 11, letterSpacing: 0.8, color: '#18181B' },
  poseText: { fontFamily: typography.headline, fontSize: 24, lineHeight: 28, letterSpacing: 0.5, color: '#18181B', textAlign: 'center' },
  poseError: { alignItems: 'center', gap: 8 },
  poseErrorText: { fontFamily: typography.bodySemiBold, fontSize: 13, color: '#18181B', textAlign: 'center' },
  retryButton: { paddingVertical: 8, paddingHorizontal: 16 },
  retryText: { fontFamily: typography.headline, fontSize: 14, color: '#18181B' },
  frame: {
    flex: 1,
    borderWidth: 3,
    borderColor: colors.borderBlack,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  actions: { flexDirection: 'row', gap: 12 },
  actionFlex: { flex: 1 },
  primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, paddingHorizontal: 20 },
  primaryButtonText: { fontFamily: typography.headline, fontSize: 16, letterSpacing: 0.6, color: '#18181B' },
  primaryButtonLight: { fontFamily: typography.headline, fontSize: 16, letterSpacing: 0.6, color: '#FFFFFF' },
  secondaryButtonText: { fontFamily: typography.headline, fontSize: 16, letterSpacing: 0.6, color: '#18181B' },
  footnote: { fontFamily: typography.bodyMedium, fontSize: 11.5, lineHeight: 16, color: '#6B7280', textAlign: 'center' },
});
