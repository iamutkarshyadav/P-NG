import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { BrutalBox } from '../BrutalBox';
import type { ProfilePromptItem } from '../../types/prompts';

const PROMPT_CREAM = '#FFFBEB';

interface DatingProfileMediaPromptCardProps {
  prompt: ProfilePromptItem;
  photoUrl?: string | null;
  /** When set, a "SUPER P!NG THIS ANSWER" button is shown under the answer. */
  onSuperPing?: () => void;
}

export const DatingProfileMediaPromptCard: React.FC<DatingProfileMediaPromptCardProps> = ({
  prompt,
  photoUrl,
  onSuperPing,
}) => {
  const hasPhoto = Boolean(photoUrl);

  if (hasPhoto) {
    return (
      <View style={styles.cardWrapper}>
        {/* Floating Question Sticker Badge */}
        <View style={styles.floatingQuestionBadge}>
          <Ionicons name="chatbubble-ellipses" size={12} color="#000" />
          <Text style={styles.floatingQuestionText}>{prompt.prompt.toUpperCase()}</Text>
        </View>

        <BrutalBox
          backgroundColor="#FFFFFF"
          borderColor={colors.borderBlack}
          borderWidth={2.8}
          borderRadius={24}
          shadowOffset={{ x: 4, y: 4 }}
          style={styles.fullWidth}
          contentStyle={styles.mediaCardContent}
        >
          {/* Framed Image */}
          <View style={styles.imageFrame}>
            <Image
              source={{ uri: photoUrl! }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={150}
            />
          </View>

          {/* Answer Caption Section */}
          <View style={styles.captionSection}>
            <Text style={styles.mediaAnswerText}>{prompt.answer}</Text>

            {onSuperPing && (
              <BrutalBox
                backgroundColor={colors.accentYellow}
                borderColor={colors.borderBlack}
                borderWidth={2}
                borderRadius={14}
                shadowOffset={{ x: 2.5, y: 2.5 }}
                onPress={onSuperPing}
                contentStyle={styles.superPingBtn}
              >
                <Ionicons name="flash" size={15} color="#18181B" style={{ marginRight: 6 }} />
                <Text style={styles.superPingText}>SUPER P!NG THIS MOMENT</Text>
              </BrutalBox>
            )}
          </View>
        </BrutalBox>
      </View>
    );
  }

  // Text-Only Prompt Card
  return (
    <View style={styles.cardWrapper}>
      <BrutalBox
        backgroundColor={PROMPT_CREAM}
        borderColor={colors.borderBlack}
        borderWidth={2.8}
        borderRadius={22}
        shadowOffset={{ x: 4, y: 4 }}
        style={styles.fullWidth}
        contentStyle={styles.textCardContent}
      >
        <View style={styles.questionRow}>
          <Text style={styles.questionText}>{prompt.prompt.toUpperCase()}</Text>
        </View>
        <Text style={styles.answerText}>{prompt.answer}</Text>

        {onSuperPing && (
          <BrutalBox
            backgroundColor={colors.accentYellow}
            borderColor={colors.borderBlack}
            borderWidth={2}
            borderRadius={14}
            shadowOffset={{ x: 2.5, y: 2.5 }}
            onPress={onSuperPing}
            style={{ marginTop: 4 }}
            contentStyle={styles.superPingBtn}
          >
            <Ionicons name="flash" size={15} color="#18181B" style={{ marginRight: 6 }} />
            <Text style={styles.superPingText}>SUPER P!NG THIS ANSWER</Text>
          </BrutalBox>
        )}
      </BrutalBox>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    position: 'relative',
    marginTop: 8,
    width: '100%',
  },
  fullWidth: {
    width: '100%',
  },
  floatingQuestionBadge: {
    position: 'absolute',
    top: -12,
    left: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.accentYellow,
    borderWidth: 2,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 3.5,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    maxWidth: '90%',
  },
  floatingQuestionText: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 11,
    color: '#000',
    letterSpacing: 0.5,
  },
  mediaCardContent: {
    padding: 12,
    paddingTop: 18,
    gap: 12,
  },
  imageFrame: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2.2,
    borderColor: colors.borderBlack,
    backgroundColor: '#E5E7EB',
  },
  captionSection: {
    paddingHorizontal: 4,
    paddingBottom: 4,
    gap: 10,
  },
  mediaAnswerText: {
    fontFamily: typography.bodyBold,
    fontSize: 16,
    color: colors.textDark,
    lineHeight: 22,
  },
  textCardContent: {
    padding: 18,
    gap: 12,
  },
  questionRow: {
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    paddingBottom: 8,
  },
  questionText: {
    fontFamily: typography.headline,
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: 0.5,
    color: colors.textDark,
  },
  answerText: {
    fontFamily: typography.bodySemiBold,
    fontSize: 16,
    lineHeight: 23,
    color: colors.textDark,
  },
  superPingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  superPingText: {
    fontFamily: typography.headline,
    fontSize: 13,
    letterSpacing: 0.5,
    color: '#18181B',
  },
});
