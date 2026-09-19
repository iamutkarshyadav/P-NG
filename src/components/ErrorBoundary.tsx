import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { BrutalBox } from './BrutalBox';
import { reportError } from '../lib/monitoring';

interface State {
  failed: boolean;
}

/** Last line of defence: shows a friendly screen instead of a white page when a screen throws. */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown): void {
    reportError(error, 'error-boundary');
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>SOMETHING BROKE</Text>
        <Text style={styles.body}>Sorry about that. The problem was reported. Try again, and if it keeps happening tell us from Settings, then Feedback.</Text>
        <BrutalBox
          backgroundColor={colors.accentYellow}
          borderRadius={16}
          onPress={() => this.setState({ failed: false })}
          contentStyle={styles.button}
        >
          <Text style={styles.buttonText}>TRY AGAIN</Text>
        </BrutalBox>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgCream, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 16 },
  title: { fontSize: 24, fontFamily: typography.headline, color: colors.textDark, letterSpacing: 0.6 },
  body: { fontSize: 14, fontFamily: typography.bodyMedium, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  button: { paddingVertical: 14, paddingHorizontal: 32, alignItems: 'center' },
  buttonText: { fontSize: 16, fontFamily: typography.headline, color: colors.textDark, letterSpacing: 0.6 },
});
