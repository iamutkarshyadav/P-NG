// src/components/profile-editor/__tests__/profileReducer.test.ts
import { describe, expect, it } from '@jest/globals';
import { profileFormReducer, createInitialProfileState } from '../profileReducer';
import type { UserAccount } from '../../../types/user';

const mockUser: UserAccount = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'test@example.com',
  name: 'Alex Rivera',
  showGenderOnProfile: true,
  bio: 'Architecture enthusiast and coffee lover.',
  isVerifiedReal: false,
  isPaused: false,
  isHidden: false,
  onboardingStep: 8,
  hasCompletedOnboarding: true,
  createdAt: '2026-01-01T00:00:00Z',
  languages: ['english', 'spanish'],
  datingIntention: 'long_term',
  heightCm: 178,
};

describe('Profile Form Reducer State Transitions', () => {
  it('initializes state correctly from a UserAccount model', () => {
    const state = createInitialProfileState(mockUser);
    expect(state.name).toBe('Alex Rivera');
    expect(state.bio).toBe('Architecture enthusiast and coffee lover.');
    expect(state.heightCm).toBe('178');
    expect(state.datingIntention).toBe('long_term');
    expect(state.languages).toEqual(['english', 'spanish']);
    expect(state.selectedTagIds).toEqual([]);
    expect(state.prompts).toEqual([]);
  });

  it('updates scalar fields cleanly without mutating previous state', () => {
    const initial = createInitialProfileState(mockUser);
    const updated = profileFormReducer(initial, {
      type: 'SET_FIELD',
      field: 'bio',
      value: 'Brand new bio narrative',
    });
    expect(updated.bio).toBe('Brand new bio narrative');
    expect(initial.bio).toBe('Architecture enthusiast and coffee lover.');
  });

  it('toggles vibe tags and respects upper boundary limit (max 8)', () => {
    const initial = createInitialProfileState(mockUser);
    const withEightTags = profileFormReducer(initial, {
      type: 'SET_TAG_IDS',
      tagIds: [1, 2, 3, 4, 5, 6, 7, 8],
    });

    // Attempting to add a 9th tag must be ignored
    const attemptedNine = profileFormReducer(withEightTags, {
      type: 'TOGGLE_TAG',
      tagId: 9,
      min: 1,
      max: 8,
    });
    expect(attemptedNine.selectedTagIds).toHaveLength(8);
    expect(attemptedNine.selectedTagIds).not.toContain(9);

    // Removing an existing tag should succeed
    const withSevenTags = profileFormReducer(withEightTags, {
      type: 'TOGGLE_TAG',
      tagId: 8,
      min: 1,
      max: 8,
    });
    expect(withSevenTags.selectedTagIds).toHaveLength(7);
    expect(withSevenTags.selectedTagIds).not.toContain(8);
  });

  it('enforces minimum vibe tags boundary (min 1)', () => {
    const initial = createInitialProfileState(mockUser);
    const withOneTag = profileFormReducer(initial, {
      type: 'SET_TAG_IDS',
      tagIds: [42],
    });

    // Attempting to toggle off the last tag must be ignored
    const attemptedZero = profileFormReducer(withOneTag, {
      type: 'TOGGLE_TAG',
      tagId: 42,
      min: 1,
      max: 8,
    });
    expect(attemptedZero.selectedTagIds).toEqual([42]);
  });

  it('handles language selection with MAX_LANGUAGES limit (max 5)', () => {
    const initial = createInitialProfileState(mockUser);
    let state = profileFormReducer(initial, { type: 'TOGGLE_LANGUAGE', language: 'french', max: 5 });
    state = profileFormReducer(state, { type: 'TOGGLE_LANGUAGE', language: 'german', max: 5 });
    state = profileFormReducer(state, { type: 'TOGGLE_LANGUAGE', language: 'japanese', max: 5 });
    expect(state.languages).toEqual(['english', 'spanish', 'french', 'german', 'japanese']);

    // Attempting 6th language should be rejected
    const stateSix = profileFormReducer(state, { type: 'TOGGLE_LANGUAGE', language: 'korean', max: 5 });
    expect(stateSix.languages).toHaveLength(5);
    expect(stateSix.languages).not.toContain('korean');
  });

  it('updates prompts immutably', () => {
    const initial = createInitialProfileState(mockUser);
    const newPrompts = [
      { slot: 1, prompt: 'A perfect Sunday looks like', answer: 'Matcha and records' },
    ];
    const next = profileFormReducer(initial, { type: 'SET_PROMPTS', prompts: newPrompts });
    expect(next.prompts).toEqual(newPrompts);
  });
});
