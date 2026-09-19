import React, { useState } from 'react';
import { Alert, StyleSheet, Switch, Text, TextInput, View, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { BrutalBox } from './BrutalBox';
import { PhotoGrid } from './PhotoGrid';
import { usePhotos } from '../hooks/usePhotos';
import { useSession } from '../providers/SessionProvider';
import { updateProfile } from '../services/profile';
import { errorMessage } from '../services/errors';
import type { UserAccount } from '../types/user';

const MIN_PHOTOS = 2;
const BIO_MAX = 500;

interface ProfileEditorProps {
  user: UserAccount;
  onDone: () => void;
}

/** Edit name, bio, gender visibility and photos. Photo changes apply immediately; text saves on demand. */
export const ProfileEditor: React.FC<ProfileEditorProps> = ({ user, onDone }) => {
  const { setUser } = useSession();
  const { photos, uploadingSlots, addPhoto, removePhoto, makePrimary } = usePhotos(user.id);
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio ?? '');
  const [showGender, setShowGender] = useState(user.showGenderOnProfile);
  const [saving, setSaving] = useState(false);

  const dirty =
    name.trim() !== user.name || bio.trim() !== (user.bio ?? '') || showGender !== user.showGenderOnProfile;

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      Alert.alert('Name too short', 'Your name must be at least 2 characters.');
      return;
    }
    if (!bio.trim()) {
      Alert.alert('Bio needed', 'Write a few words about yourself.');
      return;
    }
    if (photos.length < MIN_PHOTOS) {
      Alert.alert('Add more photos', `Keep at least ${MIN_PHOTOS} photos on your profile.`);
      return;
    }
    setSaving(true);
    try {
      const updated = await updateProfile(user, {
        display_name: trimmedName,
        bio: bio.trim(),
        show_gender: showGender,
      });
      setUser(updated);
      onDone();
    } catch (e) {
      Alert.alert('Could not save', errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>NAME</Text>
      <View style={styles.inputBox}>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          maxLength={40}
          placeholder="Your name"
          placeholderTextColor="#888"
          accessibilityLabel="Name"
        />
      </View>

      <Text style={styles.label}>ABOUT ME</Text>
      <View style={[styles.inputBox, styles.bioBox]}>
        <TextInput
          style={[styles.input, styles.bioInput]}
          value={bio}
          onChangeText={setBio}
          maxLength={BIO_MAX}
          multiline
          placeholder="A few words about you"
          placeholderTextColor="#888"
          accessibilityLabel="About me"
        />
      </View>
      <Text style={styles.counter}>
        {bio.length}/{BIO_MAX}
      </Text>

      <View style={styles.toggleRow}>
        <View style={styles.toggleText}>
          <Text style={styles.toggleTitle}>SHOW MY GENDER</Text>
          <Text style={styles.toggleSub}>Display it on your profile card</Text>
        </View>
        <Switch
          value={showGender}
          onValueChange={setShowGender}
          trackColor={{ true: colors.primaryPink, false: '#D4D4D8' }}
          accessibilityLabel="Show my gender on my profile"
        />
      </View>

      <Text style={styles.label}>
        PHOTOS ({photos.length}/6, first is primary)
      </Text>
      <PhotoGrid
        photos={photos}
        uploadingSlots={uploadingSlots}
        onAdd={addPhoto}
        onRemove={removePhoto}
        onMakePrimary={makePrimary}
        minPhotos={MIN_PHOTOS}
      />

      <BrutalBox
        backgroundColor={dirty ? colors.accentYellow : '#E5E7EB'}
        borderColor={colors.borderBlack}
        borderWidth={2.4}
        borderRadius={16}
        shadowOffset={{ x: 3, y: 3 }}
        onPress={handleSave}
        disabled={saving}
        contentStyle={styles.saveContent}
      >
        {saving ? (
          <ActivityIndicator color={colors.textDark} />
        ) : (
          <Text style={styles.saveText}>{dirty ? 'SAVE CHANGES' : 'DONE'}</Text>
        )}
      </BrutalBox>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { width: '100%', gap: 10 },
  label: {
    fontSize: 12,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.6,
    marginTop: 8,
  },
  inputBox: {
    borderWidth: 2.2,
    borderColor: colors.borderBlack,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
  },
  input: {
    height: 48,
    fontSize: 15,
    fontFamily: typography.bodySemiBold,
    color: colors.textDark,
  },
  bioBox: { paddingVertical: 4 },
  bioInput: { height: 110, textAlignVertical: 'top', paddingTop: 10 },
  counter: {
    alignSelf: 'flex-end',
    fontSize: 11,
    fontFamily: typography.bodyBold,
    color: colors.textMuted,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  toggleText: { flex: 1, paddingRight: 12 },
  toggleTitle: { fontSize: 13, fontFamily: typography.bodyExtraBold, color: colors.textDark },
  toggleSub: { fontSize: 12, fontFamily: typography.bodyMedium, color: colors.textMuted },
  saveContent: { paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  saveText: { fontSize: 17, fontFamily: typography.headline, color: colors.textDark, letterSpacing: 0.6 },
});
