// src/types/lifestyle.ts
// Structured attributes, options, emojis, and labels for Bumble-style profile badges.

export interface LifestyleAttributes {
  datingIntention?: string | null;
  heightCm?: number | null;
  drinkingHabits?: string | null;
  smokingHabits?: string | null;
  workoutHabits?: string | null;
  petPreference?: string | null;
  familyPlans?: string | null;
  zodiacSign?: string | null;
  educationLevel?: string | null;
  religion?: string | null;
  politics?: string | null;
}

export interface LifestyleBadgeItem {
  key: string;
  title: string;
  label: string;
  emoji?: string;
  iconFamily: 'Ionicons' | 'MaterialCommunityIcons' | 'Feather';
  iconName: string;
  category: 'basics' | 'lifestyle';
  tint?: string;
}

export interface AttributeOption {
  value: string;
  label: string;
  emoji?: string;
  badgeLabel?: string;
}

export const DATING_INTENTION_OPTIONS: AttributeOption[] = [
  { value: 'long_term', label: 'Long-term relationship', badgeLabel: 'LONG-TERM PARTNER' },
  { value: 'long_term_open_to_short', label: 'Long-term, open to short', badgeLabel: 'LONG-TERM, OPEN TO SHORT' },
  { value: 'short_term_open_to_long', label: 'Short-term, open to long', badgeLabel: 'SHORT-TERM, OPEN TO LONG' },
  { value: 'short_term', label: 'Short-term fun', badgeLabel: 'SHORT-TERM FUN' },
  { value: 'figuring_out', label: 'Still figuring it out', badgeLabel: 'STILL FIGURING IT OUT' },
  { value: 'new_friends', label: 'New friends & vibe', badgeLabel: 'NEW FRIENDS & VIBES' },
];

export const WORKOUT_OPTIONS: AttributeOption[] = [
  { value: 'everyday', label: 'Daily (active lifestyle)', badgeLabel: 'WORKS OUT DAILY' },
  { value: 'often', label: 'Often (gym & outdoor)', badgeLabel: 'WORKS OUT OFTEN' },
  { value: 'sometimes', label: 'Sometimes active', badgeLabel: 'WORKS OUT SOMETIMES' },
  { value: 'never', label: 'Almost never', badgeLabel: 'RARELY WORKS OUT' },
];

export const DRINKING_OPTIONS: AttributeOption[] = [
  { value: 'socially', label: 'Socially (wine & cocktails)', badgeLabel: 'DRINKS SOCIALLY' },
  { value: 'never', label: 'Never / Non-drinker', badgeLabel: "DOESN'T DRINK" },
  { value: 'sober', label: 'Sober life', badgeLabel: 'SOBER' },
  { value: 'frequently', label: 'Frequently', badgeLabel: 'DRINKS FREQUENTLY' },
];

export const SMOKING_OPTIONS: AttributeOption[] = [
  { value: 'never', label: 'Never / Non-smoker', badgeLabel: 'NEVER SMOKES' },
  { value: 'socially', label: 'Social smoker', badgeLabel: 'SMOKES SOCIALLY' },
  { value: 'regular', label: 'Regular smoker', badgeLabel: 'SMOKES REGULARLY' },
];

export const PET_OPTIONS: AttributeOption[] = [
  { value: 'cat_person', label: 'Cat person / Cat parent', badgeLabel: 'CAT PERSON' },
  { value: 'dog_person', label: 'Dog lover / Dog parent', badgeLabel: 'DOG PERSON' },
  { value: 'all_pets', label: 'Loves all animals', badgeLabel: 'LOVES ALL ANIMALS' },
  { value: 'none', label: 'No pets for now', badgeLabel: 'NO PETS' },
];

export const FAMILY_PLANS_OPTIONS: AttributeOption[] = [
  { value: 'want_kids', label: 'Wants kids someday', badgeLabel: 'WANTS CHILDREN SOMEDAY' },
  { value: 'dont_want_kids', label: 'Don’t want kids', badgeLabel: 'DON’T WANT CHILDREN' },
  { value: 'open_to_kids', label: 'Open to kids', badgeLabel: 'OPEN TO CHILDREN' },
  { value: 'have_and_want_more', label: 'Have kids & want more', badgeLabel: 'HAVE KIDS & WANT MORE' },
  { value: 'have_and_dont_want', label: 'Have kids & all set', badgeLabel: 'HAVE KIDS & ALL SET' },
];

export const ZODIAC_OPTIONS: AttributeOption[] = [
  { value: 'aries', label: 'Aries', badgeLabel: 'ARIES SUN' },
  { value: 'taurus', label: 'Taurus', badgeLabel: 'TAURUS SUN' },
  { value: 'gemini', label: 'Gemini', badgeLabel: 'GEMINI SUN' },
  { value: 'cancer', label: 'Cancer', badgeLabel: 'CANCER SUN' },
  { value: 'leo', label: 'Leo', badgeLabel: 'LEO SUN' },
  { value: 'virgo', label: 'Virgo', badgeLabel: 'VIRGO SUN' },
  { value: 'libra', label: 'Libra', badgeLabel: 'LIBRA SUN' },
  { value: 'scorpio', label: 'Scorpio', badgeLabel: 'SCORPIO SUN' },
  { value: 'sagittarius', label: 'Sagittarius', badgeLabel: 'SAGITTARIUS SUN' },
  { value: 'capricorn', label: 'Capricorn', badgeLabel: 'CAPRICORN SUN' },
  { value: 'aquarius', label: 'Aquarius', badgeLabel: 'AQUARIUS SUN' },
  { value: 'pisces', label: 'Pisces', badgeLabel: 'PISCES SUN' },
];

export const EDUCATION_OPTIONS: AttributeOption[] = [
  { value: 'high_school', label: 'High School Graduate', badgeLabel: 'HIGH SCHOOL GRADUATE' },
  { value: 'in_college', label: 'Undergrad in College', badgeLabel: 'UNDERGRAD IN COLLEGE' },
  { value: 'undergrad', label: 'Bachelor’s Degree', badgeLabel: 'BACHELOR’S DEGREE' },
  { value: 'postgrad', label: 'Master’s / Postgraduate', badgeLabel: "MASTER'S / POSTGRAD" },
  { value: 'doctorate', label: 'PhD / Doctorate', badgeLabel: 'PHD / DOCTORATE' },
  { value: 'trade_school', label: 'Trade / Vocational', badgeLabel: 'TRADE & VOCATIONAL' },
];

export const RELIGION_OPTIONS: AttributeOption[] = [
  { value: 'agnostic', label: 'Agnostic', badgeLabel: 'AGNOSTIC' },
  { value: 'atheist', label: 'Atheist', badgeLabel: 'ATHEIST' },
  { value: 'spiritual', label: 'Spiritual but not religious', badgeLabel: 'SPIRITUAL' },
  { value: 'christian', label: 'Christian', badgeLabel: 'CHRISTIAN' },
  { value: 'hindu', label: 'Hindu', badgeLabel: 'HINDU' },
  { value: 'muslim', label: 'Muslim', badgeLabel: 'MUSLIM' },
  { value: 'jewish', label: 'Jewish', badgeLabel: 'JEWISH' },
  { value: 'buddhist', label: 'Buddhist', badgeLabel: 'BUDDHIST' },
  { value: 'other', label: 'Other beliefs', badgeLabel: 'OTHER BELIEFS' },
];

export const POLITICS_OPTIONS: AttributeOption[] = [
  { value: 'liberal', label: 'Liberal / Progressive', badgeLabel: 'LIBERAL' },
  { value: 'moderate', label: 'Moderate', badgeLabel: 'MODERATE' },
  { value: 'conservative', label: 'Conservative', badgeLabel: 'CONSERVATIVE' },
  { value: 'apolitical', label: 'Not political', badgeLabel: 'NOT POLITICAL' },
  { value: 'other', label: 'Other political views', badgeLabel: 'OTHER VIEWS' },
];

export const MAX_LANGUAGES = 5;

export const LANGUAGE_OPTIONS: AttributeOption[] = [
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'bengali', label: 'Bengali' },
  { value: 'tamil', label: 'Tamil' },
  { value: 'telugu', label: 'Telugu' },
  { value: 'marathi', label: 'Marathi' },
  { value: 'gujarati', label: 'Gujarati' },
  { value: 'kannada', label: 'Kannada' },
  { value: 'malayalam', label: 'Malayalam' },
  { value: 'punjabi', label: 'Punjabi' },
  { value: 'urdu', label: 'Urdu' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'french', label: 'French' },
  { value: 'german', label: 'German' },
  { value: 'portuguese', label: 'Portuguese' },
  { value: 'italian', label: 'Italian' },
  { value: 'arabic', label: 'Arabic' },
  { value: 'mandarin', label: 'Mandarin' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'korean', label: 'Korean' },
  { value: 'russian', label: 'Russian' },
];

export function languageLabel(value: string): string {
  return LANGUAGE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

/** Saved deal-breakers: an empty list means "no filter" for that attribute. */
export interface DealbreakerFilters {
  intentions: string[];
  drinking: string[];
  smoking: string[];
  workout: string[];
  pets: string[];
  family: string[];
}

export const EMPTY_DEALBREAKERS: DealbreakerFilters = {
  intentions: [],
  drinking: [],
  smoking: [],
  workout: [],
  pets: [],
  family: [],
};

function findOption(options: AttributeOption[], value?: string | null): AttributeOption | undefined {
  if (!value) return undefined;
  return options.find((o) => o.value.toLowerCase() === value.toLowerCase());
}

/** Formats height from cm into both Imperial and Metric (e.g. 5'8" (172 CM)) */
export function formatHeightBadge(cm?: number | null): string | null {
  if (!cm || cm <= 0) return null;
  const totalInches = Math.round(cm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}'${inches}" (${cm} CM)`;
}
export const formatHeight = formatHeightBadge;

export function getLifestyleBadges(profile: LifestyleAttributes): LifestyleBadgeItem[] {
  const badges: LifestyleBadgeItem[] = [];

  // 1. Looking For (Dating Intention)
  const intention = findOption(DATING_INTENTION_OPTIONS, profile.datingIntention);
  if (intention) {
    badges.push({
      key: 'looking_for',
      title: 'LOOKING FOR',
      label: intention.badgeLabel || intention.label.toUpperCase(),
      iconFamily: 'Ionicons',
      iconName: 'heart-outline',
      category: 'basics',
      tint: '#EDE9FE', // Lavender
    });
  }

  // 2. Height
  const heightText = formatHeightBadge(profile.heightCm);
  if (heightText) {
    badges.push({
      key: 'height',
      title: 'HEIGHT',
      label: heightText,
      iconFamily: 'MaterialCommunityIcons',
      iconName: 'ruler',
      category: 'basics',
      tint: '#FFFFFF',
    });
  }

  // 3. Exercise / Workout Habits
  const workout = findOption(WORKOUT_OPTIONS, profile.workoutHabits);
  if (workout) {
    badges.push({
      key: 'workout',
      title: 'EXERCISE',
      label: workout.badgeLabel || workout.label.toUpperCase(),
      iconFamily: 'Ionicons',
      iconName: 'barbell-outline',
      category: 'lifestyle',
      tint: '#FFE600', // Neo-brutalist yellow
    });
  }

  // 4. Drinking Habits
  const drinking = findOption(DRINKING_OPTIONS, profile.drinkingHabits);
  if (drinking) {
    badges.push({
      key: 'drinking',
      title: 'DRINKING',
      label: drinking.badgeLabel || drinking.label.toUpperCase(),
      iconFamily: 'Ionicons',
      iconName: 'wine-outline',
      category: 'lifestyle',
      tint: '#F4F4F5', // Zinc
    });
  }

  // 5. Smoking Habits
  const smoking = findOption(SMOKING_OPTIONS, profile.smokingHabits);
  if (smoking) {
    badges.push({
      key: 'smoking',
      title: 'SMOKING',
      label: smoking.badgeLabel || smoking.label.toUpperCase(),
      iconFamily: 'MaterialCommunityIcons',
      iconName: 'smoking-off',
      category: 'lifestyle',
      tint: '#FFE4E6', // Soft pink
    });
  }

  // 6. Pets
  const pets = findOption(PET_OPTIONS, profile.petPreference);
  if (pets) {
    badges.push({
      key: 'pets',
      title: 'PETS',
      label: pets.badgeLabel || pets.label.toUpperCase(),
      iconFamily: 'Ionicons',
      iconName: 'paw-outline',
      category: 'lifestyle',
      tint: '#E0E7FF', // Soft indigo
    });
  }

  // 7. Family Plans
  const family = findOption(FAMILY_PLANS_OPTIONS, profile.familyPlans);
  if (family) {
    badges.push({
      key: 'family_plans',
      title: 'FAMILY PLANS',
      label: family.badgeLabel || family.label.toUpperCase(),
      iconFamily: 'Ionicons',
      iconName: 'people-outline',
      category: 'lifestyle',
      tint: '#EDE9FE', // Lavender
    });
  }

  // 8. Zodiac Sign
  const zodiac = findOption(ZODIAC_OPTIONS, profile.zodiacSign);
  if (zodiac) {
    badges.push({
      key: 'zodiac',
      title: 'ZODIAC',
      label: zodiac.badgeLabel || zodiac.label.toUpperCase(),
      iconFamily: 'Ionicons',
      iconName: 'sparkles-outline',
      category: 'basics',
      tint: '#FFE600', // Neo-brutalist yellow
    });
  }

  // 9. Education
  const edu = findOption(EDUCATION_OPTIONS, profile.educationLevel);
  if (edu) {
    badges.push({
      key: 'education',
      title: 'EDUCATION',
      label: edu.badgeLabel || edu.label.toUpperCase(),
      iconFamily: 'Ionicons',
      iconName: 'school-outline',
      category: 'basics',
      tint: '#FFFFFF',
    });
  }

  // 10. Religion / Spirituality
  const religion = findOption(RELIGION_OPTIONS, profile.religion);
  if (religion) {
    badges.push({
      key: 'religion',
      title: 'SPIRITUALITY',
      label: religion.badgeLabel || religion.label.toUpperCase(),
      iconFamily: 'Ionicons',
      iconName: 'leaf-outline',
      category: 'lifestyle',
      tint: '#F4F4F5', // Zinc
    });
  }

  // 11. Politics
  const politics = findOption(POLITICS_OPTIONS, profile.politics);
  if (politics) {
    badges.push({
      key: 'politics',
      title: 'POLITICS',
      label: politics.badgeLabel || politics.label.toUpperCase(),
      iconFamily: 'Ionicons',
      iconName: 'flag-outline',
      category: 'lifestyle',
      tint: '#FFE4E6', // Soft pink
    });
  }

  return badges;
}
