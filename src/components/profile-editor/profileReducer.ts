// src/components/profile-editor/profileReducer.ts
// Consolidated, high-performance form state reducer for Master Dating Profile Studio.

import type { UserAccount } from '../../types/user';
import type { ProfilePromptItem } from '../../types/prompts';

export type TagCategoryFilter = 'ALL' | 'LIFESTYLE' | 'MUSIC' | 'CREATIVE' | 'FOOD';

export interface ProfileFormState {
  name: string;
  bio: string;
  showGender: boolean;
  occupation: string;
  pronouns: string;
  hometown: string;
  languages: string[];
  showReligion: boolean;
  showPolitics: boolean;
  photo2Caption: string;
  photo3Caption: string;
  anthemTrack: string;
  anthemArtist: string;
  datingIntention: string | null;
  heightCm: string;
  workoutHabits: string | null;
  drinkingHabits: string | null;
  smokingHabits: string | null;
  petPreference: string | null;
  familyPlans: string | null;
  zodiacSign: string | null;
  educationLevel: string | null;
  religion: string | null;
  politics: string | null;
  selectedTagIds: number[];
  activeTagCategory: TagCategoryFilter;
  prompts: ProfilePromptItem[];
}

export type ProfileFormAction =
  | {
      type: 'SET_FIELD';
      field: keyof Omit<ProfileFormState, 'languages' | 'selectedTagIds' | 'prompts'>;
      value: string | boolean | null;
    }
  | { type: 'TOGGLE_LANGUAGE'; language: string; max: number }
  | { type: 'TOGGLE_TAG'; tagId: number; min: number; max: number }
  | { type: 'SET_TAG_CATEGORY'; category: TagCategoryFilter }
  | { type: 'SET_TAG_IDS'; tagIds: number[] }
  | { type: 'SET_PROMPTS'; prompts: ProfilePromptItem[] };

export function createInitialProfileState(user: UserAccount): ProfileFormState {
  return {
    name: user.name,
    bio: user.bio ?? '',
    showGender: user.showGenderOnProfile,
    occupation: user.occupation ?? '',
    pronouns: user.pronouns ?? '',
    hometown: user.hometown ?? '',
    languages: user.languages ?? [],
    showReligion: user.showReligion ?? true,
    showPolitics: user.showPolitics ?? true,
    photo2Caption: user.photo2Prompt ?? '',
    photo3Caption: user.photo3Prompt ?? '',
    anthemTrack: user.anthemTrack ?? '',
    anthemArtist: user.anthemArtist ?? '',
    datingIntention: user.datingIntention ?? null,
    heightCm: user.heightCm ? String(user.heightCm) : '',
    workoutHabits: user.workoutHabits ?? null,
    drinkingHabits: user.drinkingHabits ?? null,
    smokingHabits: user.smokingHabits ?? null,
    petPreference: user.petPreference ?? null,
    familyPlans: user.familyPlans ?? null,
    zodiacSign: user.zodiacSign ?? null,
    educationLevel: user.educationLevel ?? null,
    religion: user.religion ?? null,
    politics: user.politics ?? null,
    selectedTagIds: [],
    activeTagCategory: 'ALL',
    prompts: [],
  };
}

export function profileFormReducer(
  state: ProfileFormState,
  action: ProfileFormAction
): ProfileFormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };

    case 'TOGGLE_LANGUAGE': {
      const exists = state.languages.includes(action.language);
      if (exists) {
        return { ...state, languages: state.languages.filter((l) => l !== action.language) };
      }
      if (state.languages.length >= action.max) {
        return state;
      }
      return { ...state, languages: [...state.languages, action.language] };
    }

    case 'TOGGLE_TAG': {
      const exists = state.selectedTagIds.includes(action.tagId);
      if (exists) {
        if (state.selectedTagIds.length <= action.min) return state;
        return {
          ...state,
          selectedTagIds: state.selectedTagIds.filter((id) => id !== action.tagId),
        };
      }
      if (state.selectedTagIds.length >= action.max) return state;
      return {
        ...state,
        selectedTagIds: [...state.selectedTagIds, action.tagId],
      };
    }

    case 'SET_TAG_CATEGORY':
      return { ...state, activeTagCategory: action.category };

    case 'SET_TAG_IDS':
      return { ...state, selectedTagIds: action.tagIds };

    case 'SET_PROMPTS':
      return { ...state, prompts: action.prompts };

    default:
      return state;
  }
}
