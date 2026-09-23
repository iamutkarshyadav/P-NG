export type Gender = 'woman' | 'man' | 'non_binary' | 'other';

/** The signed-in user as the UI sees it (assembled from auth + the profiles row). */
export interface UserAccount {
  id: string;
  email: string;
  name: string;
  birthday?: string;
  age?: number;
  zodiacSign?: string;
  gender?: Gender;
  showGenderOnProfile: boolean;
  bio?: string;
  city?: string;
  isVerifiedReal: boolean;
  isPaused: boolean;
  isHidden: boolean;
  onboardingStep: number;
  hasCompletedOnboarding: boolean;
  createdAt: string;
  datingIntention?: string | null;
  heightCm?: number | null;
  drinkingHabits?: string | null;
  smokingHabits?: string | null;
  workoutHabits?: string | null;
  petPreference?: string | null;
  familyPlans?: string | null;
  educationLevel?: string | null;
  religion?: string | null;
  politics?: string | null;
  pronouns?: string | null;
  hometown?: string | null;
  languages?: string[];
  showReligion?: boolean;
  showPolitics?: boolean;
  occupation?: string | null;
  anthemTrack?: string | null;
  anthemArtist?: string | null;
  voiceNotePrompt?: string | null;
  voiceNoteDuration?: string | null;
  photo2Prompt?: string | null;
  photo3Prompt?: string | null;
}
