import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { ProfilePromptItem } from '../types/prompts';
import { DatingProfileMediaPromptCard } from './profile-view/DatingProfileMediaPromptCard';
import { useSignedUrls } from '../hooks/useSignedUrls';

export interface ProfilePromptCardProps {
  prompt: ProfilePromptItem;
  photoUrl?: string | null;
  /** When set, a "SUPER P!NG THIS ANSWER" button is shown under the answer. */
  onSuperPing?: () => void;
}

/** One prompt: media prompt card if photo is present, otherwise cream Anton card. */
export const ProfilePromptCard: React.FC<ProfilePromptCardProps> = ({ prompt, photoUrl, onSuperPing }) => (
  <DatingProfileMediaPromptCard prompt={prompt} photoUrl={photoUrl} onSuperPing={onSuperPing} />
);

interface ProfilePromptsProps {
  prompts: ProfilePromptItem[];
  onSuperPing?: () => void;
}

/** All of a person's prompts, stacked with media photo support. Renders nothing when empty. */
export const ProfilePrompts: React.FC<ProfilePromptsProps> = ({ prompts, onSuperPing }) => {
  const photoPaths = prompts.map((p) => p.photoPath).filter((p): p is string => Boolean(p));
  const urls = useSignedUrls(photoPaths);

  if (prompts.length === 0) return null;
  return (
    <View style={styles.stack}>
      {prompts.map((p) => (
        <DatingProfileMediaPromptCard
          key={p.slot}
          prompt={p}
          photoUrl={p.photoPath ? urls[p.photoPath] : null}
          onSuperPing={onSuperPing}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  stack: { gap: 16 },
});
