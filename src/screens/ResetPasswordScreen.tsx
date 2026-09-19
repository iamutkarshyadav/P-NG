import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { LAYOUT } from '../theme/responsive';
import { DotGridBackground } from '../components/DotGridBackground';
import { BrutalBox } from '../components/BrutalBox';
import { PingLogoHeader } from '../components/PingLogoHeader';
import { changePassword } from '../services/auth';

interface ResetPasswordScreenProps {
  onDone: () => void;
}

/** Shown after someone opens the password-reset link from their email. */
export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ onDone }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (password !== confirm) {
      Alert.alert('Passwords differ', 'The two passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      const result = await changePassword(password);
      if (!result.ok) {
        Alert.alert('Could not update password', result.error);
        return;
      }
      Alert.alert('Password updated', 'You are signed in with your new password.');
      onDone();
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <DotGridBackground />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <PingLogoHeader />
            <Text style={styles.title}>SET A NEW PASSWORD</Text>
            <Text style={styles.subtitle}>Choose something at least 8 characters long.</Text>

            <BrutalBox
              backgroundColor={colors.cardWhite}
              borderColor={colors.borderBlack}
              borderWidth={2.6}
              borderRadius={24}
              shadowOffset={{ x: 4, y: 4 }}
              style={styles.card}
              contentStyle={styles.cardContent}
            >
              <View style={styles.inputBox}>
                <Feather name="lock" size={18} color="#444" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="New password"
                  placeholderTextColor="#888"
                  secureTextEntry={!show}
                  autoCapitalize="none"
                  accessibilityLabel="New password"
                />
                <TouchableOpacity
                  onPress={() => setShow((v) => !v)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityRole="button"
                  accessibilityLabel={show ? 'Hide password' : 'Show password'}
                >
                  <Feather name={show ? 'eye-off' : 'eye'} size={18} color="#444" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputBox}>
                <Feather name="check-circle" size={18} color="#444" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  value={confirm}
                  onChangeText={setConfirm}
                  placeholder="Confirm new password"
                  placeholderTextColor="#888"
                  secureTextEntry={!show}
                  autoCapitalize="none"
                  onSubmitEditing={handleSave}
                  accessibilityLabel="Confirm new password"
                />
              </View>

              <BrutalBox
                backgroundColor={colors.accentYellow}
                borderColor={colors.borderBlack}
                borderWidth={2.4}
                borderRadius={18}
                shadowOffset={{ x: 3, y: 3 }}
                onPress={handleSave}
                disabled={saving}
                contentStyle={styles.button}
              >
                {saving ? <ActivityIndicator color={colors.textDark} /> : <Text style={styles.buttonText}>SAVE PASSWORD</Text>}
              </BrutalBox>

              <TouchableOpacity onPress={onDone} accessibilityRole="button" style={styles.skip}>
                <Text style={styles.skipText}>Not now</Text>
              </TouchableOpacity>
            </BrutalBox>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: colors.bgCream },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  container: { width: '100%', maxWidth: LAYOUT.shellMaxWidth, alignSelf: 'center', alignItems: 'center', gap: 14 },
  title: { fontSize: 24, fontFamily: typography.headline, color: colors.textDark, letterSpacing: 0.6, marginTop: 8 },
  subtitle: { fontSize: 14, fontFamily: typography.bodyMedium, color: colors.textMuted, textAlign: 'center' },
  card: { width: '100%' },
  cardContent: { padding: 22, gap: 16 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2.2,
    borderColor: colors.borderBlack,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    height: 52,
    paddingHorizontal: 14,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, height: '100%', fontSize: 14, fontFamily: typography.bodySemiBold, color: colors.textDark },
  button: { height: 50, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontSize: 18, fontFamily: typography.headline, color: colors.textDark, letterSpacing: 0.8 },
  skip: { alignSelf: 'center' },
  skipText: { fontSize: 13, fontFamily: typography.bodyBold, color: colors.textDark, textDecorationLine: 'underline' },
});
