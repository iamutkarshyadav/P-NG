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
}
