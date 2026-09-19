import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { LAYOUT } from '../theme/responsive';
import { BrutalBox } from './BrutalBox';
import { UserAccount } from '../types/user';

interface OnboardingTopHeaderProps {
  user?: UserAccount;
  onBack?: () => void;
  onLogout?: () => void;
}

export const OnboardingTopHeader: React.FC<OnboardingTopHeaderProps> = ({
  onBack,
  onLogout,
}) => {
  const [showExitModal, setShowExitModal] = useState(false);

  const handlePressLogo = () => {
    if (onLogout || onBack) {
      setShowExitModal(true);
    }
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    if (onLogout) {
      onLogout();
    } else if (onBack) {
      onBack();
    }
  };

  return (
    <View style={styles.headerContainer}>
      {/* Left-Aligned Single Iconic Pink P!NG Logo Badge (Tappable to Exit/Log Out) */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePressLogo}
        disabled={!onLogout && !onBack}
      >
        <BrutalBox
          backgroundColor={colors.primaryPink}
          borderColor={colors.borderBlack}
          borderWidth={2.2}
          borderRadius={8}
          shadowOffset={{ x: 2, y: 2 }}
          contentStyle={styles.logoBadge}
        >
          <Text style={styles.logoBadgeText}>
            P<Text style={{ color: colors.accentYellow }}>!</Text>NG
          </Text>
        </BrutalBox>
      </TouchableOpacity>

      {/* Neo-Brutalist Exit / Logout Confirmation Modal */}
      <Modal
        visible={showExitModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCardWrap}>
            <BrutalBox
              backgroundColor="#FFFFFF"
              borderColor={colors.borderBlack}
              borderWidth={3}
              borderRadius={20}
              shadowOffset={{ x: 5, y: 5 }}
              contentStyle={styles.modalCardContent}
            >
              <View style={styles.modalTag}>
                <Text style={styles.modalTagText}>⚠️ EXIT ONBOARDING</Text>
              </View>

              <Text style={styles.modalTitle}>RETURN TO LOGIN?</Text>
              <Text style={styles.modalSubtitle}>
                Are you sure you want to exit onboarding and log out back to the demo accounts login screen?
              </Text>

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setShowExitModal(false)}
                  style={styles.modalBtnHalf}
                >
                  <BrutalBox
                    backgroundColor="#EBE7E0"
                    borderColor={colors.borderBlack}
                    borderWidth={2.2}
                    borderRadius={12}
                    shadowOffset={{ x: 2, y: 2 }}
                    contentStyle={styles.modalBtnContent}
                  >
                    <Text style={styles.modalCancelText}>CONTINUE</Text>
                  </BrutalBox>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleConfirmExit}
                  style={styles.modalBtnHalf}
                >
                  <BrutalBox
                    backgroundColor="#B5003D"
                    borderColor={colors.borderBlack}
                    borderWidth={2.2}
                    borderRadius={12}
                    shadowOffset={{ x: 2, y: 2 }}
                    contentStyle={styles.modalBtnContent}
                  >
                    <Text style={styles.modalLogoutText}>LOG OUT ➔</Text>
                  </BrutalBox>
                </TouchableOpacity>
              </View>
            </BrutalBox>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    maxWidth: LAYOUT.shellMaxWidth,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: 'transparent',
  },
  logoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  logoBadgeText: {
    fontSize: 18,
    fontFamily: typography.headline,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCardWrap: {
    width: '100%',
    maxWidth: 380,
  },
  modalCardContent: {
    padding: 20,
    paddingTop: 24,
    gap: 12,
  },
  modalTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentYellow,
    borderWidth: 2,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  modalTagText: {
    fontSize: 10.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: typography.headline,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  modalSubtitle: {
    fontSize: 13,
    fontFamily: typography.bodyMedium,
    color: '#4B5563',
    lineHeight: 18,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  modalBtnHalf: {
    flex: 1,
  },
  modalBtnContent: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 13,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  modalLogoutText: {
    fontSize: 13,
    fontFamily: typography.bodyExtraBold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
