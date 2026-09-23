// src/components/ProfileEditor.tsx
// Master Dating Profile Studio: photos, captions, bio, vibe tags/hashtags, prompts, anthem, and lifestyle attributes.

import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { updateProfile } from '../services/profile';
import { fetchMyPrompts, saveMyPrompts } from '../services/prompts';
import { fetchAllTags, fetchMyTagIds, saveMyTags } from '../services/tags';
import { ProfilePromptsEditor } from './ProfilePromptsEditor';
import type { ProfilePromptItem } from '../types/prompts';
import { errorMessage } from '../services/errors';
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

const MIN_PHOTOS = 2;
const BIO_MAX = 500;
const MIN_TAGS = 1;
const MAX_TAGS = 8;

type TagCategoryFilter = 'ALL' | 'LIFESTYLE' | 'MUSIC' | 'CREATIVE' | 'FOOD';
const TAG_CATEGORIES: TagCategoryFilter[] = ['ALL', 'LIFESTYLE', 'MUSIC', 'CREATIVE', 'FOOD'];

interface ProfileEditorProps {
  user: UserAccount;
  onDone: () => void;
}

function OptionPills({
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
              accessibilityLabel={`${opt.emoji} ${opt.label}`}
            >
              <BrutalBox
                backgroundColor={isSelected ? colors.accentYellow : '#FFFFFF'}
                borderColor={colors.borderBlack}
                borderWidth={1.8}
                borderRadius={12}
                shadowOffset={{ x: 2, y: 2 }}
                contentStyle={styles.pillContent}
              >
                <Text style={styles.pillEmoji}>{opt.emoji}</Text>
                <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>{opt.label}</Text>
              </BrutalBox>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

/** Master Dating Profile Editor & Studio */
export const ProfileEditor: React.FC<ProfileEditorProps> = ({ user, onDone }) => {
  const { setUser } = useSession();
  const queryClient = useQueryClient();
  const { photos, uploadingSlots, addPhoto, removePhoto, makePrimary } = usePhotos(user.id);

  // Basics & Bio
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio ?? '');
  const [showGender, setShowGender] = useState(user.showGenderOnProfile);
  const [occupation, setOccupation] = useState(user.occupation ?? '');
  const [pronouns, setPronouns] = useState(user.pronouns ?? '');
  const [hometown, setHometown] = useState(user.hometown ?? '');
  const [languages, setLanguages] = useState<string[]>(user.languages ?? []);
  const [showReligion, setShowReligion] = useState(user.showReligion ?? true);
  const [showPolitics, setShowPolitics] = useState(user.showPolitics ?? true);
  const [photo2Caption, setPhoto2Caption] = useState(user.photo2Prompt ?? '');
  const [photo3Caption, setPhoto3Caption] = useState(user.photo3Prompt ?? '');
  const [anthemTrack, setAnthemTrack] = useState(user.anthemTrack ?? '');
  const [anthemArtist, setAnthemArtist] = useState(user.anthemArtist ?? '');

  // Lifestyle attributes
  const [datingIntention, setDatingIntention] = useState(user.datingIntention ?? null);
  const [heightCm, setHeightCm] = useState(user.heightCm ? String(user.heightCm) : '');
  const [workoutHabits, setWorkoutHabits] = useState(user.workoutHabits ?? null);
  const [drinkingHabits, setDrinkingHabits] = useState(user.drinkingHabits ?? null);
  const [smokingHabits, setSmokingHabits] = useState(user.smokingHabits ?? null);
  const [petPreference, setPetPreference] = useState(user.petPreference ?? null);
  const [familyPlans, setFamilyPlans] = useState(user.familyPlans ?? null);
  const [zodiacSign, setZodiacSign] = useState(user.zodiacSign ?? null);
  const [educationLevel, setEducationLevel] = useState(user.educationLevel ?? null);
  const [religion, setReligion] = useState(user.religion ?? null);
  const [politics, setPolitics] = useState(user.politics ?? null);

  // Vibe Tags / Hashtags Studio
  const tagsQuery = useQuery({ queryKey: ['tags'], queryFn: fetchAllTags, staleTime: 10 * 60_000 });
  const myTagsQuery = useQuery({ queryKey: ['my-tags', user.id], queryFn: () => fetchMyTagIds(user.id) });
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [activeTagCategory, setActiveTagCategory] = useState<TagCategoryFilter>('ALL');
  const loadedTags = useRef<string | null>(null);

  useEffect(() => {
    if (myTagsQuery.data && loadedTags.current === null) {
      loadedTags.current = JSON.stringify([...myTagsQuery.data].sort((a, b) => a - b));
      setSelectedTagIds(myTagsQuery.data);
    }
  }, [myTagsQuery.data]);

  const allTags = useMemo(() => tagsQuery.data ?? [], [tagsQuery.data]);
  const filteredTags = useMemo(() => {
    if (activeTagCategory === 'ALL') return allTags;
    return allTags.filter((t) => t.category.toUpperCase() === activeTagCategory);
  }, [activeTagCategory, allTags]);

  const tagsDirty =
    loadedTags.current !== null &&
    JSON.stringify([...selectedTagIds].sort((a, b) => a - b)) !== loadedTags.current;

  // Profile Prompts Studio
  const promptsQuery = useQuery({ queryKey: ['my-prompts', user.id], queryFn: fetchMyPrompts });
  const [prompts, setPrompts] = useState<ProfilePromptItem[]>([]);
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
      setPrompts(promptsQuery.data);
    }
  }, [promptsQuery.data]);

  const promptsReady = loadedPrompts.current !== null;
  const cleanPrompts: ProfilePromptItem[] = prompts
    .filter((p) => p.prompt && p.answer.trim())
    .map((p) => ({
      slot: p.slot,
      prompt: p.prompt,
      answer: p.answer.trim(),
      photoPath: p.photoPath ?? null,
    }));
  const promptsDirty = promptsReady && JSON.stringify(cleanPrompts) !== loadedPrompts.current;

  const [saving, setSaving] = useState(false);
  const parsedHeightNum = heightCm.trim() ? parseInt(heightCm.trim(), 10) : null;

  const handleToggleTag = (tagId: number) => {
    if (selectedTagIds.includes(tagId)) {
      if (selectedTagIds.length <= MIN_TAGS) {
        Alert.alert('Minimum Tags', `Keep at least ${MIN_TAGS} vibe tag so others know your style.`);
        return;
      }
      setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId));
    } else {
      if (selectedTagIds.length >= MAX_TAGS) {
        Alert.alert('Limit Reached', `You can select up to ${MAX_TAGS} vibe tags.`);
        return;
      }
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
  };

  const dirty =
    name.trim() !== user.name ||
    bio.trim() !== (user.bio ?? '') ||
    showGender !== user.showGenderOnProfile ||
    datingIntention !== (user.datingIntention ?? null) ||
    heightCm.trim() !== (user.heightCm ? String(user.heightCm) : '') ||
    workoutHabits !== (user.workoutHabits ?? null) ||
    drinkingHabits !== (user.drinkingHabits ?? null) ||
    smokingHabits !== (user.smokingHabits ?? null) ||
    petPreference !== (user.petPreference ?? null) ||
    familyPlans !== (user.familyPlans ?? null) ||
    zodiacSign !== (user.zodiacSign ?? null) ||
    educationLevel !== (user.educationLevel ?? null) ||
    religion !== (user.religion ?? null) ||
    politics !== (user.politics ?? null) ||
    occupation.trim() !== (user.occupation ?? '') ||
    pronouns.trim() !== (user.pronouns ?? '') ||
    hometown.trim() !== (user.hometown ?? '') ||
    JSON.stringify(languages) !== JSON.stringify(user.languages ?? []) ||
    showReligion !== (user.showReligion ?? true) ||
    showPolitics !== (user.showPolitics ?? true) ||
    photo2Caption.trim() !== (user.photo2Prompt ?? '') ||
    photo3Caption.trim() !== (user.photo3Prompt ?? '') ||
    anthemTrack.trim() !== (user.anthemTrack ?? '') ||
    anthemArtist.trim() !== (user.anthemArtist ?? '') ||
    tagsDirty ||
    promptsDirty;

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      Alert.alert('Name too short', 'Your name must be at least 2 characters.');
      return;
    }
    if (!bio.trim()) {
      Alert.alert('Bio needed', 'Write a few words about yourself so matches can connect.');
      return;
    }
    if (photos.length < MIN_PHOTOS) {
      Alert.alert('Add more photos', `Keep at least ${MIN_PHOTOS} photos on your profile.`);
      return;
    }
    if (selectedTagIds.length < MIN_TAGS) {
      Alert.alert('Vibe Tags Needed', `Select at least ${MIN_TAGS} vibe tag.`);
      return;
    }

    if (parsedHeightNum !== null && (parsedHeightNum < 90 || parsedHeightNum > 250)) {
      Alert.alert('Check height', 'Please enter a valid height between 90 and 250 cm.');
      return;
    }

    const unfinished = prompts.find((p) => p.prompt && !p.answer.trim());
    if (unfinished) {
      Alert.alert('Finish your prompt', `Answer prompt ${unfinished.slot} or remove it.`);
      return;
    }

    setSaving(true);
    try {
      if (tagsDirty) {
        await saveMyTags(selectedTagIds);
        loadedTags.current = JSON.stringify([...selectedTagIds].sort((a, b) => a - b));
        await queryClient.invalidateQueries({ queryKey: ['my-tags', user.id] });
      }

      if (promptsDirty) {
        await saveMyPrompts(cleanPrompts);
        loadedPrompts.current = JSON.stringify(cleanPrompts);
        await queryClient.invalidateQueries({ queryKey: ['my-prompts', user.id] });
      }

      const updated = await updateProfile(user, {
        display_name: trimmedName,
        bio: bio.trim(),
        show_gender: showGender,
        dating_intention: datingIntention,
        height_cm: parsedHeightNum,
        workout_habits: workoutHabits,
        drinking_habits: drinkingHabits,
        smoking_habits: smokingHabits,
        pet_preference: petPreference,
        family_plans: familyPlans,
        zodiac_sign: zodiacSign,
        education_level: educationLevel,
        religion: religion,
        politics: politics,
        occupation: occupation.trim() || null,
        pronouns: pronouns.trim() || null,
        hometown: hometown.trim() || null,
        languages,
        show_religion: showReligion,
        show_politics: showPolitics,
        photo_2_prompt: photo2Caption.trim() || null,
        photo_3_prompt: photo3Caption.trim() || null,
        anthem_track: anthemTrack.trim() || null,
        anthem_artist: anthemArtist.trim() || null,
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
      {/* 1. BASIC IDENTITY */}
      <View style={styles.sectionSeparator}>
        <Text style={styles.sectionHeaderTitle}>IDENTITY & BASICS</Text>
      </View>

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

      <Text style={styles.label}>ABOUT ME (BIO)</Text>
      <View style={[styles.inputBox, styles.bioBox]}>
        <TextInput
          style={[styles.input, styles.bioInput]}
          value={bio}
          onChangeText={setBio}
          maxLength={BIO_MAX}
          multiline
          placeholder="A few words about you, your humor, or what you love..."
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
          <Text style={styles.toggleSub}>Display it clearly on your profile card</Text>
        </View>
        <Switch
          value={showGender}
          onValueChange={setShowGender}
          trackColor={{ true: colors.primaryPink, false: '#D4D4D8' }}
          accessibilityLabel="Show my gender on my profile"
        />
      </View>

      <Text style={styles.label}>WORK / OCCUPATION</Text>
      <View style={styles.inputBox}>
        <TextInput
          style={styles.input}
          value={occupation}
          onChangeText={setOccupation}
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
          value={pronouns}
          onChangeText={setPronouns}
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
          value={hometown}
          onChangeText={setHometown}
          maxLength={80}
          placeholder="Where you are from"
          placeholderTextColor="#888"
          accessibilityLabel="Hometown"
        />
      </View>

      <Text style={styles.label}>
        LANGUAGES ({languages.length}/{MAX_LANGUAGES})
      </Text>
      <View style={styles.languageWrap}>
        {LANGUAGE_OPTIONS.map((opt) => {
          const selected = languages.includes(opt.value);
          return (
            <TouchableOpacity
              key={opt.value}
              activeOpacity={0.8}
              onPress={() =>
                setLanguages((cur) =>
                  cur.includes(opt.value)
                    ? cur.filter((v) => v !== opt.value)
                    : cur.length < MAX_LANGUAGES
                      ? [...cur, opt.value]
                      : cur
                )
              }
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
        minPhotos={MIN_PHOTOS}
      />

      {photos.length >= 2 ? (
        <>
          <Text style={styles.label}>PHOTO 2 CAPTION</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={photo2Caption}
              onChangeText={setPhoto2Caption}
              maxLength={200}
              placeholder="A witty story or context for your 2nd photo"
              placeholderTextColor="#888"
              accessibilityLabel="Photo 2 caption"
            />
          </View>
        </>
      ) : null}

      {photos.length >= 3 ? (
        <>
          <Text style={styles.label}>PHOTO 3 CAPTION</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={photo3Caption}
              onChangeText={setPhoto3Caption}
              maxLength={200}
              placeholder="A line about your 3rd photo"
              placeholderTextColor="#888"
              accessibilityLabel="Photo 3 caption"
            />
          </View>
        </>
      ) : null}

      {/* 3. VIBE TAGS & HASHTAGS STUDIO */}
      <View style={styles.sectionSeparator}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>VIBE TAGS & HASHTAGS</Text>
          <View style={styles.badgeCounter}>
            <Text style={styles.badgeCounterText}>
              {selectedTagIds.length}/{MAX_TAGS} SELECTED
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
          const isActive = activeTagCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              activeOpacity={0.8}
              onPress={() => setActiveTagCategory(cat)}
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
          const isSelected = selectedTagIds.includes(tag.id);
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
                <Text style={styles.tagEmoji}>{tag.emoji}</Text>
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
              value={anthemTrack}
              onChangeText={setAnthemTrack}
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
              value={anthemArtist}
              onChangeText={setAnthemArtist}
              maxLength={80}
              placeholder="e.g. The Weeknd, Dua Lipa, Fleetwood Mac"
              placeholderTextColor="#888"
              accessibilityLabel="Anthem artist"
            />
          </View>
        </View>

        {anthemTrack.trim().length > 0 && (
          <View style={styles.anthemLiveBadge}>
            <Ionicons name="play-circle" size={16} color="#000" />
            <Text style={styles.anthemLiveText} numberOfLines={1}>
              {anthemTrack} {anthemArtist.trim() ? `• ${anthemArtist}` : ''}
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
            value={heightCm}
            onChangeText={setHeightCm}
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
        selected={datingIntention}
        onSelect={setDatingIntention}
      />

      {/* Workout */}
      <OptionPills
        label="EXERCISE & WORKOUT"
        options={WORKOUT_OPTIONS}
        selected={workoutHabits}
        onSelect={setWorkoutHabits}
      />

      {/* Drinking */}
      <OptionPills
        label="DRINKING"
        options={DRINKING_OPTIONS}
        selected={drinkingHabits}
        onSelect={setDrinkingHabits}
      />

      {/* Smoking */}
      <OptionPills
        label="SMOKING"
        options={SMOKING_OPTIONS}
        selected={smokingHabits}
        onSelect={setSmokingHabits}
      />

      {/* Pets */}
      <OptionPills
        label="PET PREFERENCE"
        options={PET_OPTIONS}
        selected={petPreference}
        onSelect={setPetPreference}
      />

      {/* Family Plans */}
      <OptionPills
        label="FAMILY PLANS"
        options={FAMILY_PLANS_OPTIONS}
        selected={familyPlans}
        onSelect={setFamilyPlans}
      />

      {/* Zodiac Sign */}
      <OptionPills
        label="ZODIAC SIGN"
        options={ZODIAC_OPTIONS}
        selected={zodiacSign}
        onSelect={setZodiacSign}
      />

      {/* Education */}
      <OptionPills
        label="EDUCATION LEVEL"
        options={EDUCATION_OPTIONS}
        selected={educationLevel}
        onSelect={setEducationLevel}
      />

      {/* Religion */}
      <OptionPills
        label="RELIGION / SPIRITUALITY"
        options={RELIGION_OPTIONS}
        selected={religion}
        onSelect={setReligion}
      />

      <View style={styles.toggleRow}>
        <View style={styles.toggleText}>
          <Text style={styles.toggleTitle}>SHOW MY RELIGION</Text>
          <Text style={styles.toggleSub}>Turn off to keep it private</Text>
        </View>
        <Switch
          value={showReligion}
          onValueChange={setShowReligion}
          trackColor={{ true: colors.primaryPink, false: '#D4D4D8' }}
          accessibilityLabel="Show my religion on my profile"
        />
      </View>

      {/* Politics */}
      <OptionPills
        label="POLITICS"
        options={POLITICS_OPTIONS}
        selected={politics}
        onSelect={setPolitics}
      />

      <View style={styles.toggleRow}>
        <View style={styles.toggleText}>
          <Text style={styles.toggleTitle}>SHOW MY POLITICS</Text>
          <Text style={styles.toggleSub}>Turn off to keep it private</Text>
        </View>
        <Switch
          value={showPolitics}
          onValueChange={setShowPolitics}
          trackColor={{ true: colors.primaryPink, false: '#D4D4D8' }}
          accessibilityLabel="Show my politics on my profile"
        />
      </View>

      {/* 6. PROMPTS & Q&A */}
      <View style={styles.sectionSeparator}>
        <Text style={styles.sectionHeaderTitle}>PROFILE PROMPTS</Text>
        <Text style={styles.sectionSubtitle}>Great conversation starters that get you pinged.</Text>
      </View>

      {promptsReady ? <ProfilePromptsEditor userId={user.id} value={prompts} onChange={setPrompts} /> : null}

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
  tagEmoji: {
    fontSize: 15,
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
  pillEmoji: {
    fontSize: 13.5,
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
