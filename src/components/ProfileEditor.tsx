// src/components/ProfileEditor.tsx
// Master Dating Profile Studio: photos, captions, bio, vibe tags/hashtags, prompts, anthem, and lifestyle attributes.
// Hardened with consolidated reducer state, atomic transaction saves, strict input bounds, and Sentry observability.

import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { BrutalBox } from './BrutalBox';
import { PhotoGrid } from './PhotoGrid';
import { usePhotos } from '../hooks/usePhotos';
import { useSession } from '../providers/SessionProvider';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { saveFullProfileTransaction } from '../services/profile';
import { fetchMyPrompts } from '../services/prompts';
import { fetchAllTags, fetchMyTagIds } from '../services/tags';
import { ProfilePromptsEditor } from './ProfilePromptsEditor';
import type { ProfilePromptItem } from '../types/prompts';
import { errorMessage } from '../services/errors';
import { reportError } from '../lib/monitoring';
import type { UserAccount } from '../types/user';
import {
  DATING_INTENTION_OPTIONS,
  LANGUAGE_OPTIONS,
  MAX_LANGUAGES,
  WORKOUT_OPTIONS,
  DRINKING_OPTIONS,
  SMOKING_OPTIONS,
  PET_OPTIONS,
  FAMILY_PLANS_OPTIONS,
  ZODIAC_OPTIONS,
  EDUCATION_OPTIONS,
  RELIGION_OPTIONS,
  POLITICS_OPTIONS,
  formatHeight,
  AttributeOption,
} from '../types/lifestyle';
import {
  ProfileFormState,
  TagCategoryFilter,
  createInitialProfileState,
  profileFormReducer,
} from './profile-editor/profileReducer';

const MIN_PHOTOS = 2;
const BIO_MAX = 500;
const MIN_TAGS = 1;
const MAX_TAGS = 8;

const TAG_CATEGORIES: TagCategoryFilter[] = ['ALL', 'LIFESTYLE', 'MUSIC', 'CREATIVE', 'FOOD'];

interface ProfileEditorProps {
  user: UserAccount;
  onDone: () => void;
}

const OptionPills = React.memo(function OptionPills({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: AttributeOption[];
  selected?: string | null;
  onSelect: (val: string | null) => void;
}) {
  return (
    <View style={styles.optionSection}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsRow}>
        {options.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              activeOpacity={0.8}
              onPress={() => onSelect(isSelected ? null : opt.value)}
              accessibilityRole="button"
              accessibilityLabel={opt.label}
            >
              <BrutalBox
                backgroundColor={isSelected ? colors.accentYellow : '#FFFFFF'}
                borderColor={colors.borderBlack}
                borderWidth={1.8}
                borderRadius={12}
                shadowOffset={{ x: 2, y: 2 }}
                contentStyle={styles.pillContent}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>{opt.label}</Text>
              </BrutalBox>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
});

/** Master Dating Profile Editor & Studio */
export const ProfileEditor: React.FC<ProfileEditorProps> = ({ user, onDone }) => {
  const { setUser } = useSession();
  const queryClient = useQueryClient();
  const { photos, uploadingSlots, addPhoto, removePhoto, makePrimary, reorderPhotos } =
    usePhotos(user.id);

  // Consolidated form state reducer
  const [state, dispatch] = useReducer(profileFormReducer, user, createInitialProfileState);

  const setField = useCallback(
    (field: keyof Omit<ProfileFormState, 'languages' | 'selectedTagIds' | 'prompts'>, value: string | boolean | null) => {
      dispatch({ type: 'SET_FIELD', field, value });
    },
    []
  );

  // Vibe Tags / Hashtags Studio
  const tagsQuery = useQuery({ queryKey: ['tags'], queryFn: fetchAllTags, staleTime: 10 * 60_000 });
  const myTagsQuery = useQuery({ queryKey: ['my-tags', user.id], queryFn: () => fetchMyTagIds(user.id) });
  const loadedTags = useRef<string | null>(null);

  useEffect(() => {
    if (myTagsQuery.data && loadedTags.current === null) {
      loadedTags.current = JSON.stringify([...myTagsQuery.data].sort((a, b) => a - b));
      dispatch({ type: 'SET_TAG_IDS', tagIds: myTagsQuery.data });
    }
  }, [myTagsQuery.data]);

  const allTags = useMemo(() => tagsQuery.data ?? [], [tagsQuery.data]);
  const filteredTags = useMemo(() => {
    if (state.activeTagCategory === 'ALL') return allTags;
    return allTags.filter((t) => t.category.toUpperCase() === state.activeTagCategory);
  }, [state.activeTagCategory, allTags]);

  const tagsDirty =
    loadedTags.current !== null &&
    JSON.stringify([...state.selectedTagIds].sort((a, b) => a - b)) !== loadedTags.current;

  // Profile Prompts Studio
  const promptsQuery = useQuery({ queryKey: ['my-prompts', user.id], queryFn: fetchMyPrompts });
  const loadedPrompts = useRef<string | null>(null);

  useEffect(() => {
    if (promptsQuery.data && loadedPrompts.current === null) {
      const normalized = (promptsQuery.data ?? [])
        .filter((p) => p.prompt && p.answer.trim())
        .map((p) => ({
          slot: p.slot,
          prompt: p.prompt,
          answer: p.answer.trim(),
          photoPath: p.photoPath ?? null,
        }));
      loadedPrompts.current = JSON.stringify(normalized);
      dispatch({ type: 'SET_PROMPTS', prompts: promptsQuery.data });
    }
  }, [promptsQuery.data]);

  const promptsReady = loadedPrompts.current !== null;
  const cleanPrompts: ProfilePromptItem[] = useMemo(() => {
    return state.prompts
      .filter((p) => p.prompt && p.answer.trim())
      .map((p) => ({
        slot: p.slot,
        prompt: p.prompt,
        answer: p.answer.trim(),
        photoPath: p.photoPath ?? null,
      }));
  }, [state.prompts]);

  const promptsDirty = promptsReady && JSON.stringify(cleanPrompts) !== loadedPrompts.current;

  const [saving, setSaving] = useState(false);

  // Height parse helper for live indicator
  const cleanHeightStr = state.heightCm.trim();
  const parsedHeightNum =
    cleanHeightStr && Number.isInteger(Number(cleanHeightStr)) ? Number(cleanHeightStr) : null;

  const handleToggleTag = useCallback(
    (tagId: number) => {
      if (state.selectedTagIds.includes(tagId)) {
        if (state.selectedTagIds.length <= MIN_TAGS) {
          Alert.alert('Minimum Tags', `Keep at least ${MIN_TAGS} vibe tag so others know your style.`);
          return;
        }
      } else {
        if (state.selectedTagIds.length >= MAX_TAGS) {
          Alert.alert('Limit Reached', `You can select up to ${MAX_TAGS} vibe tags.`);
          return;
        }
      }
      dispatch({ type: 'TOGGLE_TAG', tagId, min: MIN_TAGS, max: MAX_TAGS });
    },
    [state.selectedTagIds]
  );

  const dirty = useMemo(() => {
    return (
      state.name.trim() !== user.name ||
      state.bio.trim() !== (user.bio ?? '') ||
      state.showGender !== user.showGenderOnProfile ||
      state.datingIntention !== (user.datingIntention ?? null) ||
      state.heightCm.trim() !== (user.heightCm ? String(user.heightCm) : '') ||
      state.workoutHabits !== (user.workoutHabits ?? null) ||
      state.drinkingHabits !== (user.drinkingHabits ?? null) ||
      state.smokingHabits !== (user.smokingHabits ?? null) ||
      state.petPreference !== (user.petPreference ?? null) ||
      state.familyPlans !== (user.familyPlans ?? null) ||
      state.zodiacSign !== (user.zodiacSign ?? null) ||
      state.educationLevel !== (user.educationLevel ?? null) ||
      state.religion !== (user.religion ?? null) ||
      state.politics !== (user.politics ?? null) ||
      state.occupation.trim() !== (user.occupation ?? '') ||
      state.pronouns.trim() !== (user.pronouns ?? '') ||
      state.hometown.trim() !== (user.hometown ?? '') ||
      state.languages.join(',') !== (user.languages ?? []).join(',') ||
      state.showReligion !== (user.showReligion ?? true) ||
      state.showPolitics !== (user.showPolitics ?? true) ||
      state.photo2Caption.trim() !== (user.photo2Prompt ?? '') ||
      state.photo3Caption.trim() !== (user.photo3Prompt ?? '') ||
      state.anthemTrack.trim() !== (user.anthemTrack ?? '') ||
      state.anthemArtist.trim() !== (user.anthemArtist ?? '') ||
      tagsDirty ||
      promptsDirty
    );
  }, [state, user, tagsDirty, promptsDirty]);

  const handleSave = async () => {
    // Sanitize display name (strip Unicode direction overrides, zero-width chars, and returns)
    const cleanDisplayName = state.name.replace(/[\u200B-\u200D\uFEFF\u202A-\u202E\r\n]/g, '').trim();
    if (cleanDisplayName.length < 2) {
      Alert.alert('Name too short', 'Your name must be at least 2 characters.');
      return;
    }
    const cleanBio = state.bio.trim();
    if (!cleanBio) {
      Alert.alert('Bio needed', 'Write a few words about yourself so matches can connect.');
      return;
    }
    if (photos.length < MIN_PHOTOS) {
      Alert.alert('Add more photos', `Keep at least ${MIN_PHOTOS} photos on your profile.`);
      return;
    }
    if (state.selectedTagIds.length < MIN_TAGS) {
      Alert.alert('Vibe Tags Needed', `Select at least ${MIN_TAGS} vibe tag.`);
      return;
    }

    // Strict numerical integer check to eliminate NaN / bypass vulnerability
    let validatedHeight: number | null = null;
    if (cleanHeightStr.length > 0) {
      const parsed = Number(cleanHeightStr);
      if (!Number.isInteger(parsed) || parsed < 90 || parsed > 250) {
        Alert.alert('Check height', 'Please enter a valid height between 90 and 250 cm.');
        return;
      }
      validatedHeight = parsed;
    }

    const unfinished = state.prompts.find((p) => p.prompt && !p.answer.trim());
    if (unfinished) {
      Alert.alert('Finish your prompt', `Answer prompt ${unfinished.slot} or remove it.`);
      return;
    }

    setSaving(true);
    try {
      // Unified single-transaction atomic persistence
      const updated = await saveFullProfileTransaction({
        user,
        profilePatch: {
          display_name: cleanDisplayName,
          bio: cleanBio,
          show_gender: state.showGender,
          dating_intention: state.datingIntention,
          height_cm: validatedHeight,
          workout_habits: state.workoutHabits,
          drinking_habits: state.drinkingHabits,
          smoking_habits: state.smokingHabits,
          pet_preference: state.petPreference,
          family_plans: state.familyPlans,
          zodiac_sign: state.zodiacSign,
          education_level: state.educationLevel,
          religion: state.religion,
          politics: state.politics,
          occupation: state.occupation.trim() || null,
          pronouns: state.pronouns.trim() || null,
          hometown: state.hometown.trim() || null,
          languages: state.languages,
          show_religion: state.showReligion,
          show_politics: state.showPolitics,
          photo_2_prompt: state.photo2Caption.trim() || null,
          photo_3_prompt: state.photo3Caption.trim() || null,
          anthem_track: state.anthemTrack.trim() || null,
          anthem_artist: state.anthemArtist.trim() || null,
        },
        tagIds: tagsDirty ? state.selectedTagIds : null,
        prompts: promptsDirty ? cleanPrompts : null,
      });

      if (tagsDirty) {
        loadedTags.current = JSON.stringify([...state.selectedTagIds].sort((a, b) => a - b));
        await queryClient.invalidateQueries({ queryKey: ['my-tags', user.id] });
      }

      if (promptsDirty) {
        loadedPrompts.current = JSON.stringify(cleanPrompts);
        await queryClient.invalidateQueries({ queryKey: ['my-prompts', user.id] });
      }

      setUser(updated);
      onDone();
    } catch (e) {
      reportError(e, 'ProfileEditor.handleSave');
      Alert.alert('Could not save', errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.wrap}>
      {/* 1. BASIC IDENTITY */}
      <View style={styles.sectionSeparator}>
        <Text style={styles.sectionHeaderTitle}>IDENTITY & BASICS</Text>
      </View>

      <Text style={styles.label}>NAME</Text>
      <View style={styles.inputBox}>
        <TextInput
          style={styles.input}
          value={state.name}
          onChangeText={(t) => setField('name', t)}
          maxLength={40}
          placeholder="Your name"
          placeholderTextColor="#888"
          accessibilityLabel="Name"
        />
      </View>

      <Text style={styles.label}>ABOUT ME (BIO)</Text>
      <View style={[styles.inputBox, styles.bioBox]}>
        <TextInput
          style={[styles.input, styles.bioInput]}
          value={state.bio}
          onChangeText={(t) => setField('bio', t)}
          maxLength={BIO_MAX}
          multiline
          placeholder="A few words about you, your humor, or what you love..."
          placeholderTextColor="#888"
          accessibilityLabel="About me"
        />
      </View>
      <Text style={styles.counter}>
        {state.bio.length}/{BIO_MAX}
      </Text>

      <View style={styles.toggleRow}>
        <View style={styles.toggleText}>
          <Text style={styles.toggleTitle}>SHOW MY GENDER</Text>
          <Text style={styles.toggleSub}>Display it clearly on your profile card</Text>
        </View>
        <Switch
          value={state.showGender}
          onValueChange={(val) => setField('showGender', val)}
          trackColor={{ true: colors.primaryPink, false: '#D4D4D8' }}
          accessibilityLabel="Show my gender on my profile"
        />
      </View>

      <Text style={styles.label}>WORK / OCCUPATION</Text>
      <View style={styles.inputBox}>
        <TextInput
          style={styles.input}
          value={state.occupation}
          onChangeText={(t) => setField('occupation', t)}
          maxLength={60}
          placeholder="e.g. Architect, Founder, Student"
          placeholderTextColor="#888"
          accessibilityLabel="Occupation"
        />
      </View>

      <Text style={styles.label}>PRONOUNS</Text>
      <View style={styles.inputBox}>
        <TextInput
          style={styles.input}
          value={state.pronouns}
          onChangeText={(t) => setField('pronouns', t)}
          maxLength={20}
          placeholder="e.g. she / her, they / them"
          placeholderTextColor="#888"
          accessibilityLabel="Pronouns"
        />
      </View>

      <Text style={styles.label}>HOMETOWN</Text>
      <View style={styles.inputBox}>
        <TextInput
          style={styles.input}
          value={state.hometown}
          onChangeText={(t) => setField('hometown', t)}
          maxLength={80}
          placeholder="Where you are from"
          placeholderTextColor="#888"
          accessibilityLabel="Hometown"
        />
      </View>

      <Text style={styles.label}>
        LANGUAGES ({state.languages.length}/{MAX_LANGUAGES})
      </Text>
      <View style={styles.languageWrap}>
        {LANGUAGE_OPTIONS.map((opt) => {
          const selected = state.languages.includes(opt.value);
          return (
            <TouchableOpacity
              key={opt.value}
              activeOpacity={0.8}
              onPress={() => dispatch({ type: 'TOGGLE_LANGUAGE', language: opt.value, max: MAX_LANGUAGES })}
              style={[styles.languagePill, selected && styles.languagePillSelected]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
            >
              <Text style={styles.languagePillText}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 2. PHOTOS & CAPTIONS */}
      <View style={styles.sectionSeparator}>
        <Text style={styles.sectionHeaderTitle}>PHOTOS & CAPTIONS</Text>
      </View>

      <Text style={styles.label}>
        PHOTOS ({photos.length}/6 — drag or tap to reorder / make primary)
      </Text>
      <PhotoGrid
        photos={photos}
        uploadingSlots={uploadingSlots}
        onAdd={addPhoto}
        onRemove={removePhoto}
        onMakePrimary={makePrimary}
        onReorder={reorderPhotos}
        captions={{
          1: state.photo2Caption,
          2: state.photo3Caption,
        }}
        onCaptionChange={(pos, text) => {
          if (pos === 1) setField('photo2Caption', text);
          if (pos === 2) setField('photo3Caption', text);
        }}
        minPhotos={MIN_PHOTOS}
      />

      {/* 3. VIBE TAGS & HASHTAGS STUDIO */}
      <View style={styles.sectionSeparator}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>VIBE TAGS & HASHTAGS</Text>
          <View style={styles.badgeCounter}>
            <Text style={styles.badgeCounterText}>
              {state.selectedTagIds.length}/{MAX_TAGS} SELECTED
            </Text>
          </View>
        </View>
        <Text style={styles.sectionSubtitle}>
          Pick {MIN_TAGS} to {MAX_TAGS} tags that showcase your personality, hobbies, and energy.
        </Text>
      </View>

      {/* Category Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagCategoriesRow}>
        {TAG_CATEGORIES.map((cat) => {
          const isActive = state.activeTagCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              activeOpacity={0.8}
              onPress={() => dispatch({ type: 'SET_TAG_CATEGORY', category: cat })}
            >
              <BrutalBox
                backgroundColor={isActive ? colors.primaryPink : '#FFFFFF'}
                borderColor={colors.borderBlack}
                borderWidth={1.8}
                borderRadius={10}
                shadowOffset={{ x: 2, y: 2 }}
                contentStyle={styles.tagCategoryContent}
              >
                <Text style={[styles.tagCategoryText, isActive && styles.tagCategoryTextActive]}>
                  {cat}
                </Text>
              </BrutalBox>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Tag Chips Grid */}
      <View style={styles.tagChipsGrid}>
        {filteredTags.map((tag) => {
          const isSelected = state.selectedTagIds.includes(tag.id);
          return (
            <TouchableOpacity
              key={tag.id}
              activeOpacity={0.8}
              onPress={() => handleToggleTag(tag.id)}
              style={styles.tagChipTouchable}
            >
              <BrutalBox
                backgroundColor={isSelected ? colors.accentYellow : '#FFFFFF'}
                borderColor={colors.borderBlack}
                borderWidth={1.8}
                borderRadius={12}
                shadowOffset={{ x: 2, y: 2 }}
                contentStyle={styles.tagChipContent}
              >
                <Text style={styles.tagName}>{tag.name}</Text>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={15} color={colors.textDark} style={{ marginLeft: 3 }} />
                )}
              </BrutalBox>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 4. SPOTIFY / PROFILE ANTHEM CARD */}
      <View style={styles.sectionSeparator}>
        <Text style={styles.sectionHeaderTitle}>PROFILE ANTHEM</Text>
        <Text style={styles.sectionSubtitle}>Your ultimate theme song right now.</Text>
      </View>

      <BrutalBox
        backgroundColor="#FFFFFF"
        borderColor={colors.borderBlack}
        borderWidth={2.4}
        borderRadius={16}
        shadowOffset={{ x: 3, y: 3 }}
        contentStyle={styles.anthemCard}
      >
        <View style={styles.anthemHeaderRow}>
          <View style={styles.anthemIconBox}>
            <Ionicons name="musical-notes" size={20} color="#1DB954" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.anthemHeading}>YOUR SONG</Text>
            <Text style={styles.anthemSub}>Featured at the top of your dating card</Text>
          </View>
        </View>

        <View style={styles.anthemInputs}>
          <Text style={styles.miniLabel}>TRACK NAME</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={state.anthemTrack}
              onChangeText={(t) => setField('anthemTrack', t)}
              maxLength={80}
              placeholder="e.g. Starboy, Levitating, Dreams"
              placeholderTextColor="#888"
              accessibilityLabel="Anthem song title"
            />
          </View>

          <Text style={styles.miniLabel}>ARTIST</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={state.anthemArtist}
              onChangeText={(t) => setField('anthemArtist', t)}
              maxLength={80}
              placeholder="e.g. The Weeknd, Dua Lipa, Fleetwood Mac"
              placeholderTextColor="#888"
              accessibilityLabel="Anthem artist"
            />
          </View>
        </View>

        {state.anthemTrack.trim().length > 0 && (
          <View style={styles.anthemLiveBadge}>
            <Ionicons name="play-circle" size={16} color="#000" />
            <Text style={styles.anthemLiveText} numberOfLines={1}>
              {state.anthemTrack} {state.anthemArtist.trim() ? `• ${state.anthemArtist}` : ''}
            </Text>
          </View>
        )}
      </BrutalBox>

      {/* 5. LIFESTYLE & COMPATIBILITY ATTRIBUTES */}
      <View style={styles.sectionSeparator}>
        <Text style={styles.sectionHeaderTitle}>LIFESTYLE & COMPATIBILITY</Text>
        <Text style={styles.sectionSubtitle}>Help potential matches align on life habits & intentions.</Text>
      </View>

      {/* Height */}
      <View style={styles.optionSection}>
        <Text style={styles.label}>HEIGHT (CM)</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            value={state.heightCm}
            onChangeText={(t) => setField('heightCm', t)}
            keyboardType="numeric"
            maxLength={3}
            placeholder="Height in cm (e.g. 180)"
            placeholderTextColor="#888"
            accessibilityLabel="Height"
          />
        </View>
        {parsedHeightNum && parsedHeightNum >= 90 && parsedHeightNum <= 250 ? (
          <Text style={styles.heightHelperText}>{formatHeight(parsedHeightNum)}</Text>
        ) : null}
      </View>

      {/* Dating Intention */}
      <OptionPills
        label="DATING INTENTION"
        options={DATING_INTENTION_OPTIONS}
        selected={state.datingIntention}
        onSelect={(val) => setField('datingIntention', val)}
      />

      {/* Workout */}
      <OptionPills
        label="EXERCISE & WORKOUT"
        options={WORKOUT_OPTIONS}
        selected={state.workoutHabits}
        onSelect={(val) => setField('workoutHabits', val)}
      />

      {/* Drinking */}
      <OptionPills
        label="DRINKING"
        options={DRINKING_OPTIONS}
        selected={state.drinkingHabits}
        onSelect={(val) => setField('drinkingHabits', val)}
      />

      {/* Smoking */}
      <OptionPills
        label="SMOKING"
        options={SMOKING_OPTIONS}
        selected={state.smokingHabits}
        onSelect={(val) => setField('smokingHabits', val)}
      />

      {/* Pets */}
      <OptionPills
        label="PET PREFERENCE"
        options={PET_OPTIONS}
        selected={state.petPreference}
        onSelect={(val) => setField('petPreference', val)}
      />

      {/* Family Plans */}
      <OptionPills
        label="FAMILY PLANS"
        options={FAMILY_PLANS_OPTIONS}
        selected={state.familyPlans}
        onSelect={(val) => setField('familyPlans', val)}
      />

      {/* Zodiac Sign */}
      <OptionPills
        label="ZODIAC SIGN"
        options={ZODIAC_OPTIONS}
        selected={state.zodiacSign}
        onSelect={(val) => setField('zodiacSign', val)}
      />

      {/* Education */}
      <OptionPills
        label="EDUCATION LEVEL"
        options={EDUCATION_OPTIONS}
        selected={state.educationLevel}
        onSelect={(val) => setField('educationLevel', val)}
      />

      {/* Religion */}
      <OptionPills
        label="RELIGION / SPIRITUALITY"
        options={RELIGION_OPTIONS}
        selected={state.religion}
        onSelect={(val) => setField('religion', val)}
      />

      <View style={styles.toggleRow}>
        <View style={styles.toggleText}>
          <Text style={styles.toggleTitle}>SHOW MY RELIGION</Text>
          <Text style={styles.toggleSub}>Turn off to keep it private</Text>
        </View>
        <Switch
          value={state.showReligion}
          onValueChange={(val) => setField('showReligion', val)}
          trackColor={{ true: colors.primaryPink, false: '#D4D4D8' }}
          accessibilityLabel="Show my religion on my profile"
        />
      </View>

      {/* Politics */}
      <OptionPills
        label="POLITICS"
        options={POLITICS_OPTIONS}
        selected={state.politics}
        onSelect={(val) => setField('politics', val)}
      />

      <View style={styles.toggleRow}>
        <View style={styles.toggleText}>
          <Text style={styles.toggleTitle}>SHOW MY POLITICS</Text>
          <Text style={styles.toggleSub}>Turn off to keep it private</Text>
        </View>
        <Switch
          value={state.showPolitics}
          onValueChange={(val) => setField('showPolitics', val)}
          trackColor={{ true: colors.primaryPink, false: '#D4D4D8' }}
          accessibilityLabel="Show my politics on my profile"
        />
      </View>

      {/* 6. PROMPTS & Q&A */}
      <View style={styles.sectionSeparator}>
        <Text style={styles.sectionHeaderTitle}>PROFILE PROMPTS</Text>
        <Text style={styles.sectionSubtitle}>Great conversation starters that get you pinged.</Text>
      </View>

      {promptsReady ? (
        <ProfilePromptsEditor
          userId={user.id}
          value={state.prompts}
          onChange={(next) => dispatch({ type: 'SET_PROMPTS', prompts: next })}
        />
      ) : null}

      {/* 7. SAVE BUTTON */}
      <BrutalBox
        backgroundColor={dirty ? colors.accentYellow : '#E5E7EB'}
        borderColor={colors.borderBlack}
        borderWidth={2.4}
        borderRadius={16}
        shadowOffset={{ x: 3, y: 3 }}
        onPress={handleSave}
        disabled={saving}
        style={{ marginTop: 20 }}
        contentStyle={styles.saveContent}
      >
        {saving ? (
          <ActivityIndicator color={colors.textDark} />
        ) : (
          <View style={styles.saveInnerRow}>
            <Feather name="check" size={18} color={colors.textDark} style={{ marginRight: 6 }} />
            <Text style={styles.saveText}>{dirty ? 'SAVE DATING PROFILE' : 'DONE'}</Text>
          </View>
        )}
      </BrutalBox>
    </View>
  );
};

const styles = StyleSheet.create({
  languageWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  languagePill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  languagePillSelected: { backgroundColor: colors.accentYellow },
  languagePillText: { fontFamily: typography.bodyBold, fontSize: 12.5, color: colors.textDark },
  wrap: { width: '100%', gap: 10, paddingBottom: 32 },
  label: {
    fontSize: 12,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.6,
    marginTop: 8,
  },
  miniLabel: {
    fontSize: 11,
    fontFamily: typography.bodyExtraBold,
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginTop: 4,
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
  sectionSeparator: {
    marginTop: 20,
    marginBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: colors.borderBlack,
    paddingBottom: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontFamily: typography.headline,
    color: colors.textDark,
    letterSpacing: 0.8,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: typography.bodyMedium,
    color: colors.textMuted,
    marginTop: 3,
  },
  badgeCounter: {
    backgroundColor: colors.accentYellow,
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeCounterText: {
    fontSize: 11,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
  },
  tagCategoriesRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 6,
  },
  tagCategoryContent: {
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  tagCategoryText: {
    fontSize: 12,
    fontFamily: typography.headline,
    color: colors.textDark,
    letterSpacing: 0.4,
  },
  tagCategoryTextActive: {
    color: colors.textDark,
  },
  tagChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  tagChipTouchable: {
    marginBottom: 4,
  },
  tagChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  tagName: {
    fontSize: 12.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.3,
  },
  anthemCard: {
    padding: 14,
    gap: 10,
  },
  anthemHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  anthemIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  anthemHeading: {
    fontSize: 13,
    fontFamily: typography.headline,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  anthemSub: {
    fontSize: 11.5,
    fontFamily: typography.bodyMedium,
    color: colors.textMuted,
  },
  anthemInputs: {
    gap: 6,
  },
  anthemLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F5E9',
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 4,
  },
  anthemLiveText: {
    fontSize: 12,
    fontFamily: typography.bodyBold,
    color: colors.textDark,
    flex: 1,
  },
  optionSection: {
    gap: 6,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
    paddingRight: 16,
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
  },
  pillText: {
    fontSize: 12.5,
    fontFamily: typography.headline,
    color: colors.textDark,
    letterSpacing: 0.3,
  },
  pillTextActive: {
    color: colors.textDark,
  },
  heightHelperText: {
    fontSize: 12,
    fontFamily: typography.bodyBold,
    color: colors.primaryPink,
    marginTop: 2,
  },
  saveContent: { paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  saveInnerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  saveText: { fontSize: 16, fontFamily: typography.headline, color: colors.textDark, letterSpacing: 0.6 },
});
